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

router.post('/share-file`', asyncHandler(async (req: Request, res: Response) => {
    const { file_path, file_name, shared_with_id } = req.body;
    const { userId } = req.query;

    // Input validation with detailed error messages
    if (!userId) {
        throw { statusCode: 401, message: 'No se ha proporcionado el ID del usuario' } as ShareFileError;
    }
    if (!file_path || !file_name) {
        throw { statusCode: 400, message: 'Se requieren la ruta y el nombre del archivo' } as ShareFileError;
    }
    if (!shared_with_id) {
        throw { statusCode: 400, message: 'Se requiere el ID del usuario con quien compartir' } as ShareFileError;
    }

    // Validate file path security
    const normalizedPath = path.normalize(file_path);
    if (!normalizedPath.startsWith(userId.toString())) {
        throw { 
            statusCode: 403, 
            message: 'No tienes permiso para compartir este archivo' 
        } as ShareFileError;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verifica si el usuario existe
        const userExists = await client.query(
            'SELECT id FROM usuarios WHERE id = $1',
            [shared_with_id]
        );

        if (userExists.rows.length === 0) {
            throw { statusCode: 404, message: 'Usuario no encontrado' } as ShareFileError;
        }

        // No permitir compartir con uno mismo
        if (Number(userId) === Number(shared_with_id)) {
            throw { 
                statusCode: 400, 
                message: 'No puedes compartir un archivo contigo mismo' 
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

        // Compartir el archivo dentro de la transacción
        const result = await client.query(
            `INSERT INTO shared_files (file_path, file_name, owner_id, shared_with_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id, shared_at`,
            [file_path, file_name, userId, shared_with_id]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Archivo compartido exitosamente',
            share: {
                id: result.rows[0].id,
                file_path,
                file_name,
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