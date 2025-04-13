import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/logout", asyncHandler(async (req: Request, res: Response) => {
    try {
        // Limpiar la cookie del token
        res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: new Date(0),
            path: '/'
        });

        return res.status(200).json({
            success: true,
            message: "Sesión cerrada correctamente"
        });
    } catch (error) {
        console.error("Error durante el logout:", error);
        return res.status(500).json({
            success: false,
            message: "Error al cerrar sesión"
        });
    }
}));

export default router;