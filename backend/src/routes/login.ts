import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import fs from "fs";
import path from "path";
import { generateToken } from "../utils/generateToken";
import { setAuthCookie } from "../utils/cookieTokenRes";

/**
 * Router instance for handling authentication routes
 */
const router = Router();

/**
 * Path to the JWT secret key file
 */
const secretPath = path.join(__dirname, "../jwt_secret.key");

/**
 * JWT secret key loaded from file
 */
const JWT_SECRET = fs.readFileSync(secretPath, "utf8").trim();

/**
 * @route POST /api/login
 * @description Authenticate user and create session
 * @access Public
 */
router.post("/login", asyncHandler(async (req: Request, res: Response) => {
    // Extract credentials from request body
    const { username, password } = req.body;

    // Validate request body
    if (!username || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    try {
        // Find user in database
        const result = await pool.query(
            "SELECT * FROM usuarios WHERE nombre_publico = $1",
            [username]
        );

        const user = result.rows[0];
        console.log(`user: ${user.password}`);

        // Check if user exists
        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // Generate JWT token
        const token = generateToken(user.id);

        // Set HTTP-only cookie with token
        setAuthCookie(res, token);

        // Send success response with user data
        return res.json({
            success: true,
            user: {
                id: user.id,
                nombre_publico: user.nombre_publico,
            }
        });
    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor" 
        });
    }
}));

export default router;