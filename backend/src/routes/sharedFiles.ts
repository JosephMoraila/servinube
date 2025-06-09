import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import fs from "fs";
import path from "path";
import UPLOAD_DIRECTORY from "../utils/UPLOAD_DIRECTORY";
import { QueryResult } from 'pg';

interface SharedFile {
    id: number;
    file_path: string;
    file_name: string;
    owner_id: number;
    shared_with_id: number;
    shared_at: Date;
    owner_name?: string;
    shared_with_name?: string;
}

const router = Router();

/**
 * @route GET /api/shared-files
 * @description Get files shared with and by the user
 * @access Private
 */
router.get("/shared-files", asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: "Se requiere ID de usuario" });
    }

    try {
        // Obtener archivos compartidos por el usuario
        const sharedByMeResult: QueryResult<SharedFile> = await pool.query(
            `SELECT sf.*, u.nombre_publico as shared_with_name
             FROM shared_files sf
             JOIN usuarios u ON u.id = sf.shared_with_id
             WHERE sf.owner_id = $1`,
            [userId]
        );

        // Obtener archivos compartidos con el usuario
        const sharedWithMeResult: QueryResult<SharedFile> = await pool.query(
            `SELECT sf.*, u.nombre_publico as owner_name
             FROM shared_files sf
             JOIN usuarios u ON u.id = sf.owner_id
             WHERE sf.shared_with_id = $1`,
            [userId]
        );

        // Verificar que los archivos existen físicamente
        const sharedByMe = sharedByMeResult.rows.filter(file => {
            const filePath = path.join(UPLOAD_DIRECTORY, userId.toString(), file.file_path);
            return fs.existsSync(filePath);
        });

        const sharedWithMe = sharedWithMeResult.rows.filter(file => {
            const filePath = path.join(UPLOAD_DIRECTORY, file.owner_id.toString(), file.file_path);
            return fs.existsSync(filePath);
        });

        res.json({
            sharedByMe,
            sharedWithMe
        });
    } catch (error) {
        console.error("Error al obtener archivos compartidos:", error);
        res.status(500).json({ message: "Error al obtener archivos compartidos" });
    }
}));

/**
 * @route POST /api/share-file
 * @description Share a file with another user
 * @access Private
 */
router.post("/share-file", asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.query;
    const { file_path, file_name, shared_with_id } = req.body;

    if (!userId || !file_path || !file_name || !shared_with_id) {
        return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    // Verificar que el archivo existe
    const fullPath = path.join(UPLOAD_DIRECTORY, userId.toString(), file_path);
    if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ message: "Archivo no encontrado" });
    }

    try {
        // Verificar que el usuario con quien se quiere compartir existe
        const userExists: QueryResult = await pool.query(
            'SELECT id FROM usuarios WHERE id = $1',
            [shared_with_id]
        );

        if (userExists.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // No permitir compartir con uno mismo
        if (shared_with_id === userId) {
            return res.status(400).json({ message: "No puedes compartir un archivo contigo mismo" });
        }

        // Verificar si el archivo ya está compartido con este usuario
        const existingShare: QueryResult = await pool.query(
            'SELECT id FROM shared_files WHERE file_path = $1 AND owner_id = $2 AND shared_with_id = $3',
            [file_path, userId, shared_with_id]
        );

        if (existingShare.rows.length > 0) {
            return res.status(400).json({ message: "El archivo ya está compartido con este usuario" });
        }

        // Insertar el nuevo registro de archivo compartido
        const result: QueryResult<SharedFile> = await pool.query(
            `INSERT INTO shared_files (file_path, file_name, owner_id, shared_with_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id, shared_at`,
            [file_path, file_name, userId, shared_with_id]
        );

        res.status(201).json({
            message: "Archivo compartido exitosamente",
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
        console.error("Error al compartir archivo:", error);
        res.status(500).json({ message: "Error al compartir el archivo" });
    }
}));

/**
 * @route DELETE /api/share-file/:id
 * @description Stop sharing a file with a user
 * @access Private
 */
router.delete("/share-file/:id", asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.query;
    const { id } = req.params;

    if (!userId) {
        return res.status(400).json({ message: "Se requiere ID de usuario" });
    }

    try {
        // Verificar que el share existe y pertenece al usuario
        const share: QueryResult<SharedFile> = await pool.query(
            'SELECT id, file_path FROM shared_files WHERE id = $1 AND owner_id = $2',
            [id, userId]
        );

        if (share.rows.length === 0) {
            return res.status(404).json({ message: "Compartición no encontrada o no autorizada" });
        }

        // Eliminar la compartición
        await pool.query('DELETE FROM shared_files WHERE id = $1', [id]);

        res.json({ 
            message: "Compartición eliminada exitosamente",
            share_id: id
        });
    } catch (error) {
        console.error("Error al dejar de compartir archivo:", error);
        res.status(500).json({ message: "Error al dejar de compartir el archivo" });
    }
}));

export default router;
