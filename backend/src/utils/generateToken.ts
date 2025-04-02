import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const secretPath = path.join(__dirname, "../jwt_secret.key");

// 📌 Verificar si ya existe una clave, si no, generarla
let JWT_SECRET: string;
if (fs.existsSync(secretPath)) {
    JWT_SECRET = fs.readFileSync(secretPath, "utf8").trim();
} else {
    JWT_SECRET = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(secretPath, JWT_SECRET);
}

console.log("JWT_SECRET cargado correctamente");

/**
 * Generates a JWT token for user authentication
 * 
 * @param {number} userId - The unique identifier of the user
 * @returns {string} A signed JWT token containing the user ID
 * 
 * @example
 * const token = generateToken(123);
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * 
 * @throws {Error} If the JWT signing process fails
 * 
 * @description
 * This function creates a JSON Web Token (JWT) that:
 * - Contains the user's ID in the payload
 * - Is signed with the application's secret key
 * - Expires in 1 hour from creation
 * - Uses HS256 algorithm for signing
 */
export const generateToken = (userId: number) => {  // Cambiar el tipo a number
    return jwt.sign(
        { userId }, 
        JWT_SECRET, 
        { expiresIn: "1h" }
    );
};
