// 👇 Rutas de autenticación
import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { pool } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { generateToken } from "../utils/generateToken";
import { setAuthCookie } from "../utils/cookieTokenRes";

const router = Router();

// 📌 Ruta donde se guardará la clave secreta

// 📌 Ruta de registro de usuario
// 📌 Ruta de registro de usuario
router.post("/register", asyncHandler(async (req: Request, res: Response) => {
    const { publicName, password } = req.body;

    if (!publicName || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    try {
        // Verificar si el usuario ya existe
        const userExists = await pool.query("SELECT * FROM usuarios WHERE nombre_publico = $1", [publicName]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "El nombre de usuario ya está en uso." });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar en la base de datos
        const result = await pool.query(
            "INSERT INTO usuarios (nombre_publico, password) VALUES ($1, $2) RETURNING id, nombre_publico",
            [publicName, hashedPassword]
        );

        const newUser = result.rows[0];

        // Generar el JWT
        const token = generateToken(newUser.id);

        // Establecer la cookie
        setAuthCookie(res, token);

        return res.status(200).json({
            success: true,
            user: {
                id: newUser.id,
                nombre_publico: newUser.nombre_publico,
            }
        });

    } catch (error) {
        console.error("Error en el registro:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
}));


export default router;
