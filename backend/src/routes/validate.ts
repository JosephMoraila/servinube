import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler";
import { pool } from "../config/db";

const router = Router();
const secretPath = path.join(__dirname, "../jwt_secret.key");

let JWT_SECRET: string;

try {
    JWT_SECRET = fs.readFileSync(secretPath, "utf8").trim();
} catch (error) {
    console.error("❌ Error al leer jwt_secret.key:", error);
    process.exit(1); // Detener la ejecución si no se puede leer la clave
}

// Ruta para validar el token JWT
router.get("/auth/validate", asyncHandler(async (req: Request, res: Response) => {
    try {
        console.log("Iniciando validación de token...");
        console.log("Cookies recibidas:", req.cookies);
        
        const token = req.cookies.token;

        if (!token) {
            console.log("No se encontró token en las cookies");
            return res.status(401).json({ 
                authenticated: false,
                message: "No token provided"
            });
        }

        // Verificar el token y obtener el payload
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
                if (err) {
                    console.log("Error al verificar token:", err);
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });

        // Verificar que el usuario existe en la base de datos
        const result = await pool.query(
            "SELECT id, nombre_publico FROM usuarios WHERE id = $1",
            [(decoded as any).userId]
        );

        if (result.rows.length === 0) {
            console.log("Usuario no encontrado en la base de datos");
            return res.status(401).json({
                authenticated: false,
                message: "User not found"
            });
        }

        const user = result.rows[0];
        console.log("Usuario validado:", user);

        return res.status(200).json({ 
            authenticated: true,
            user: {
                id: user.id,
                nombre_publico: user.nombre_publico,
            }
        });

    } catch (error) {
        console.error("Error en la validación:", error);
        return res.status(401).json({ 
            authenticated: false,
            message: "Invalid token"
        });
    }
}));

export default router;
