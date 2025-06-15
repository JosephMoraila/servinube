import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { pool } from '../config/db';

const router = Router();
router.get('/list-all-users', asyncHandler(async (req: Request, res: Response) => {
    try {
        // Consulta a la base de datos para obtener todos los usuarios
        const result = await pool.query('SELECT id, nombre_publico FROM usuarios');
        console.log('🔍 Listando todos los usuarios:', result.rows.length);

        if (result.rows.length === 0) {
            console.log('⚠️ No se encontraron usuarios');
            return res.status(404).json({ success: false, error: 'No se encontraron usuarios' });
        }

        // Mapeamos los resultados para devolver solo los campos necesarios
        const users = result.rows.map(user => ({
            id: user.id,
            name: user.nombre_publico,
        }));

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error('❌ Error al listar usuarios:', error);
        return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
}));
export default router;