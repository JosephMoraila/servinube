import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import fs from "fs";
import path from "path";
import UPLOAD_DIRECTORY from "../utils/UPLOAD_DIRECTORY";
import { QueryResult } from 'pg';

const router = Router();

/**
 * @route GET /api/shared-files
 * @description Get files shared with and by the user
 * @access Private
 */
router.get("/shared-files", asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.query;

    if (!userId || isNaN(Number(userId))) {
        return res.status(400).json({ message: "Se requiere ID de usuario válido" });
    }

    try {
        // Archivos compartidos por mí
        const sharedByMeResult = await pool.query(
            `SELECT sf.*, 
                    u.nombre_publico as shared_with_name,
                    o.nombre_publico as owner_name
             FROM shared_files sf
             JOIN usuarios u ON u.id = sf.shared_with_id
             JOIN usuarios o ON o.id = sf.owner_id
             WHERE sf.owner_id = $1`,
            [userId]
        );

        // Archivos compartidos conmigo
        const sharedWithMeResult = await pool.query(
            `SELECT sf.*, 
                    u.nombre_publico as owner_name,
                    o.nombre_publico as shared_with_name
             FROM shared_files sf
             JOIN usuarios u ON u.id = sf.owner_id
             JOIN usuarios o ON o.id = sf.shared_with_id
             WHERE sf.shared_with_id = $1`,
            [userId]
        );

        // Filtra solo los archivos que existen físicamente
        const sharedByMe = sharedByMeResult.rows.filter(file => {
            const filePath = path.join(UPLOAD_DIRECTORY, file.file_path);
            return fs.existsSync(filePath);
        });

        const sharedWithMe = sharedWithMeResult.rows.filter(file => {
            const filePath = path.join(UPLOAD_DIRECTORY, file.file_path);
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

export default router;