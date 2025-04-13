import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import { asyncHandler } from '../utils/asyncHandler';
import path from 'path';
import fs from 'fs';

const router = Router();
const uploadDir = path.join(__dirname, "../uploads");

router.post('/delete-account', asyncHandler(async (req: Request, res: Response) => {
    console.log("❌ Eliminando cuenta...");
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({
            success: false,
            message: "Se requiere ID de usuario y contraseña"
        });
    }

    try {
        // Verificar la contraseña
        const user = await pool.query('SELECT password FROM usuarios WHERE id = $1', [userId]);
        
        if (user.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        const isValid = await bcrypt.compare(password, user.rows[0].password);
        
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: "Contraseña incorrecta"
            });
        }

        // Eliminar archivos del usuario
        const userDir = path.join(uploadDir, userId.toString());
        if (fs.existsSync(userDir)) {
            fs.rmSync(userDir, { recursive: true, force: true });
        }

        // Eliminar usuario de la base de datos
        await pool.query('DELETE FROM usuarios WHERE id = $1', [userId]);

        console.log("✅ Cuenta eliminada correctamente");
        res.json({
            success: true,
            message: "Cuenta eliminada correctamente"
        });
    } catch (error) {
        console.error("❌ Error al eliminar cuenta:", error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar la cuenta"
        });
    }
}));

export default router;