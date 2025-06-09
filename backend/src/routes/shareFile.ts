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
    console.log('📋 Datos recibidos:', {
        fileName: req.body.fileName,
        folder: req.body.folder,
        userId: req.body.userId,
        username: req.body.username
    });

    const { fileName, folder, userId, username } = req.body;

    // Validaciones básicas
    if (!userId) {
        console.warn('⚠️ Intento de compartir sin userId');
        throw { statusCode: 401, message: 'No se ha proporcionado el ID del usuario' } as ShareFileError;
    }
    if (!fileName) {
        console.warn('⚠️ Intento de compartir sin fileName');
        throw { statusCode: 400, message: 'Se requiere el nombre del archivo' } as ShareFileError;
    }
    if (!username) {
        console.warn('⚠️ Intento de compartir sin username destino');
        throw { statusCode: 400, message: 'Se requiere el nombre de usuario con quien compartir' } as ShareFileError;
    }

    const client = await pool.connect();
    console.log('🔌 Conexión a base de datos establecida');

    try {
        // Buscar el usuario destino
        console.log('🔍 Buscando usuario destino:', username);
        const userResult = await client.query(
            'SELECT id FROM usuarios WHERE nombre_publico = $1',
            [username]
        );
        if (userResult.rows.length === 0) {
            console.warn('❌ Usuario destino no encontrado:', username);
            throw { statusCode: 404, message: 'Usuario no encontrado' } as ShareFileError;
        }
        const shared_with_id = userResult.rows[0].id;
        console.log('✅ Usuario destino encontrado, ID:', shared_with_id);

        // No permitir compartir con uno mismo
        if (Number(userId) === Number(shared_with_id)) {
            console.warn('⚠️ Intento de compartir consigo mismo');
            throw { 
                statusCode: 400, 
                message: 'No puedes compartir un archivo contigo mismo' 
            } as ShareFileError;
        }

        // Construir la ruta relativa del archivo
        const file_path = folder ? `${userId}/${folder}/${fileName}` : `${userId}/${fileName}`;
        console.log('📂 Ruta del archivo a compartir:', file_path);
        const normalizedPath = path.normalize(file_path);
        console.log('📂 Ruta del archivo normalizada:', normalizedPath);

        // Seguridad: el archivo debe estar bajo la carpeta del usuario
        if (!normalizedPath.startsWith(userId.toString())) {
            console.error('🚫 Intento de acceso no autorizado a ruta:', normalizedPath);
            throw { 
                statusCode: 403, 
                message: 'No tienes permiso para compartir este archivo' 
            } as ShareFileError;
        }

        // Verificar si el archivo ya está compartido
        console.log('🔍 Verificando si el archivo ya está compartido...');
        const existingShare = await client.query(
            'SELECT id FROM shared_files WHERE file_path = $1 AND owner_id = $2 AND shared_with_id = $3',
            [file_path, userId, shared_with_id]
        );
        if (existingShare.rows.length > 0) {
            console.warn('⚠️ El archivo ya está compartido');
            throw { 
                statusCode: 400, 
                message: 'El archivo ya está compartido con este usuario' 
            } as ShareFileError;
        }

        // Verificar si el archivo existe físicamente
        const fullPath = path.join(UPLOAD_DIRECTORY, normalizedPath);
        console.log('🔍 Verificando existencia del archivo en:', fullPath);
        if (!fs.existsSync(fullPath)) {
            console.error('❌ Archivo no encontrado en:', fullPath);
            throw { 
                statusCode: 404, 
                message: 'El archivo no existe' 
            } as ShareFileError;
        }
        console.log('✅ Archivo encontrado');

        // Compartir el archivo
        console.log('📝 Iniciando transacción en la base de datos...');
        await client.query('BEGIN');
        const result = await client.query(
            `INSERT INTO shared_files (file_path, file_name, owner_id, shared_with_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id, shared_at`,
            [file_path, fileName, userId, shared_with_id]
        );
        await client.query('COMMIT');
        console.log('✅ Archivo compartido exitosamente, ID:', result.rows[0].id);

        res.json({
            success: true,
            message: 'Archivo compartido exitosamente',
            share: {
                id: result.rows[0].id,
                file_path,
                file_name: fileName,
                owner_id: userId,
                shared_with_id,
                shared_at: result.rows[0].shared_at
            }
        });
    } catch (error) {
        console.error('❌ Error durante el proceso de compartir:', error);
        await client.query('ROLLBACK');
        const typedError = error as ShareFileError;
        res.status(typedError.statusCode || 500).json({
            success: false,
            message: typedError.message || 'Error al compartir el archivo'
        });
    } finally {
        client.release();
        console.log('🔌 Conexión a base de datos liberada');
    }
}));

export default router;