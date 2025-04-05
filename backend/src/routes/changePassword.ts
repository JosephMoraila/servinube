import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/change-password', asyncHandler(async (req: Request, res: Response) => {
    console.log("📝 Cambiando contraseña...");
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Se requiere ID de usuario y nueva contraseña"
        });
    }

    try {
        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña en la base de datos
        const result = await pool.query(
            'UPDATE usuarios SET password = $1 WHERE id = $2 RETURNING id',
            [hashedPassword, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        console.log("✅ Contraseña actualizada correctamente");
        res.json({
            success: true,
            message: "Contraseña actualizada correctamente"
        });
    } catch (error) {
        console.error("❌ Error al cambiar contraseña:", error);
        res.status(500).json({
            success: false,
            message: "Error al cambiar la contraseña"
        });
    }
}));

export default router;