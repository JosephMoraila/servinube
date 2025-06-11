import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { pool } from '../config/db';

const router = Router();

router.get('/get-name', asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.query;

    try {
        if (!userId) {
            console.log('❌ Error: Falta ID de usuario');
            return res.status(400).json({ success: false, error: 'Falta el ID de usuario' });
        }

        // Consulta a la base de datos
        const result = await pool.query(
            'SELECT nombre_publico FROM usuarios WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            console.log('⚠️ Usuario no encontrado');
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        const nombre = result.rows[0].nombre_publico;

        return res.status(200).json({
            success: true,
            name: nombre,
        });
    } catch (error) {
        console.error('❌ Error al obtener el nombre de usuario:', error);
        return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
}));

export default router;
