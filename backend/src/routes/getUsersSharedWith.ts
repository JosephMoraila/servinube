import express, { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { pool } from '../config/db';

const router = express.Router();

router.get('/fetch-who-users-shared-with', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { ownerId, file_path } = req.query;
        console.log(`🔍 Fetching users shared with for file: ${file_path} by owner: ${ownerId}`);

        if (!ownerId || !file_path) {
            return res.status(400).json({ success: false, error: 'Faltan parámetros requeridos' });
        }

        const result = await pool.query(
            'SELECT shared_with_id FROM shared_files WHERE owner_id = $1 AND file_path = $2',
            [ownerId, file_path]
        );

        console.log(`🔍 Found ${result.rows.length} users shared with for file: ${file_path}`);
        console.log('🔍 Result:', result.rows);

        // ✅ Envía la respuesta al cliente
        return res.json({
            success: true,
            sharedWith: result.rows.map(row => row.shared_with_id)
        });

    } catch (error: any) {
        console.error('❌ Error fetching users shared with:', error);
        return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
}));


export default router;