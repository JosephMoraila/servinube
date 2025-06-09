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
    // Recibe: fileName, folder, userId, username
    const { fileName, folder, userId, username } = req.body;

    // Validaciones básicas
    if (!userId) {
        throw { statusCode: 401, message: 'No se ha proporcionado el ID del usuario' } as ShareFileError;
    }
    if (!fileName) {
        throw { statusCode: 400, message: 'Se requiere el nombre del archivo' } as ShareFileError;
    }
    if (!username) {
        throw { statusCode: 400, message: 'Se requiere el nombre de usuario con quien compartir' } as ShareFileError;
    }

    // Buscar el ID del usuario con quien compartir
    const client = await pool.connect();
    try {
        // Buscar el usuario destino
        const userResult = await client.query(
            'SELECT id FROM usuarios WHERE nombre_publico = $1',
            [username]
        );
        if (userResult.rows.length === 0) {
            throw { statusCode: 404, message: 'Usuario no encontrado' } as ShareFileError;
        }
        const shared_with_id = userResult.rows[0].id;

        // No permitir compartir con uno mismo
        if (Number(userId) === Number(shared_with_id)) {
            throw { 
                statusCode: 400, 
                message: 'No puedes compartir un archivo contigo mismo' 
            } as ShareFileError;
        }

        // Construir la ruta relativa del archivo
        const file_path = folder ? `${userId}/${folder}/${fileName}` : `${userId}/${fileName}`;
        const normalizedPath = path.normalize(file_path);

        // Seguridad: el archivo debe estar bajo la carpeta del usuario
        if (!normalizedPath.startsWith(userId.toString())) {
            throw { 
                statusCode: 403, 
                message: 'No tienes permiso para compartir este archivo' 
            } as ShareFileError;
        }

        // Verificar si el archivo ya está compartido
        const existingShare = await client.query(
            'SELECT id FROM shared_files WHERE file_path = $1 AND owner_id = $2 AND shared_with_id = $3',
            [file_path, userId, shared_with_id]
        );
        if (existingShare.rows.length > 0) {
            throw { 
                statusCode: 400, 
                message: 'El archivo ya está compartido con este usuario' 
            } as ShareFileError;
        }

        // Verificar si el archivo existe físicamente
        const fullPath = path.join(UPLOAD_DIRECTORY, normalizedPath);
        if (!fs.existsSync(fullPath)) {
            throw { 
                statusCode: 404, 
                message: 'El archivo no existe' 
            } as ShareFileError;
        }

        // Compartir el archivo
        await client.query('BEGIN');
        const result = await client.query(
            `INSERT INTO shared_files (file_path, file_name, owner_id, shared_with_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id, shared_at`,
            [file_path, fileName, userId, shared_with_id]
        );
        await client.query('COMMIT');

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
        await client.query('ROLLBACK');
        const typedError = error as ShareFileError;
        console.error('Error al compartir archivo:', typedError);
        res.status(typedError.statusCode || 500).json({
            success: false,
            message: typedError.message || 'Error al compartir el archivo'
        });
    } finally {
        client.release();
    }
}));

export default router;