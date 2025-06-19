import express, { Request, Response } from 'express';
import { pool } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import path from 'path';
import fs from 'fs';
import UPLOAD_DIRECTORY from '../utils/UPLOAD_DIRECTORY';

interface ShareFileError extends Error {
    statusCode?: number;
    message: string;
}

const router = express.Router();

router.post('/shareFile', asyncHandler(async (req: Request, res: Response) => {
    console.log('📤 Iniciando proceso de compartir archivo...');
    const { fileName, folder, userId, usernames } = req.body;
    console.log(`Usernames: ${usernames}`);

    console.log('📋 Datos recibidos:', {
        fileName,
        folder,
        userId,
        usernames
    });

    if (!userId) {
        throw { statusCode: 401, message: 'No se ha proporcionado el ID del usuario' } as ShareFileError;
    }
    if (!fileName) {
        throw { statusCode: 400, message: 'Se requiere el nombre del archivo' } as ShareFileError;
    }
    if (!Array.isArray(usernames) || usernames.length === 0) {
        throw { statusCode: 400, message: 'Se requiere al menos un nombre de usuario para compartir' } as ShareFileError;
    }

    const client = await pool.connect();
    console.log('🔌 Conexión a base de datos establecida');

    const file_path = folder ? `${userId}/${folder}/${fileName}` : `${userId}/${fileName}`;
    const normalizedPath = path.normalize(file_path);

    if (!normalizedPath.startsWith(userId.toString())) {
        throw { statusCode: 403, message: 'No tienes permiso para compartir este archivo' } as ShareFileError;
    }

    const fullPath = path.join(UPLOAD_DIRECTORY, normalizedPath);
    if (!fs.existsSync(fullPath)) {
        throw { statusCode: 404, message: 'El archivo no existe' } as ShareFileError;
    }

    const results: any[] = [];
    const errors: any[] = [];

    try {
        await client.query('BEGIN');

        for (const username of usernames) {
            console.log(`🔍 Procesando usuario destino: ${username}`);

            try {
                const userResult = await client.query(
                    'SELECT id FROM usuarios WHERE nombre_publico = $1',
                    [username]
                );

                if (userResult.rows.length === 0) {
                    console.warn(`❌ Usuario no encontrado: ${username}`);
                    errors.push({ username, error: 'Usuario no encontrado' });
                    continue;
                }

                const shared_with_id = userResult.rows[0].id;

                if (Number(userId) === Number(shared_with_id)) {
                    console.warn(`⚠️ No se puede compartir contigo mismo: ${username}`);
                    errors.push({ username, error: 'No puedes compartir un archivo contigo mismo' });
                    continue;
                }

                const existingShare = await client.query(
                    'SELECT id FROM shared_files WHERE file_path = $1 AND owner_id = $2 AND shared_with_id = $3',
                    [file_path, userId, shared_with_id]
                );

                if (existingShare.rows.length > 0) {
                    console.warn(`⚠️ Archivo ya compartido con ${username}`);
                    errors.push({ username, error: 'Archivo ya compartido con este usuario' });
                    continue;
                }

                const insertResult = await client.query(
                    `INSERT INTO shared_files (file_path, file_name, owner_id, shared_with_id)
                     VALUES ($1, $2, $3, $4)
                     RETURNING id, shared_at`,
                    [file_path, fileName, userId, shared_with_id]
                );

                results.push({
                    username,
                    id: insertResult.rows[0].id,
                    file_path,
                    file_name: fileName,
                    owner_id: userId,
                    shared_with_id,
                    shared_at: insertResult.rows[0].shared_at
                });

                console.log(`✅ Compartido con ${username}`);
            } catch (innerErr) {
                console.error(`❌ Error compartiendo con ${username}:`, innerErr);
                errors.push({ username, error: 'Error interno al compartir' });
            }
        }

        await client.query('COMMIT');
    } catch (error) {
        console.error('❌ Error general durante el proceso de compartir:', error);
        await client.query('ROLLBACK');
        throw { statusCode: 500, message: 'Error al compartir el archivo' } as ShareFileError;
    } finally {
        client.release();
        console.log('🔌 Conexión a base de datos liberada');
    }

    res.json({
        success: true,
        message: 'Proceso de compartición finalizado',
        shared: results,
        errors
    });
}));


export default router;