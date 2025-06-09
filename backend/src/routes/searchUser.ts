import express, { Request, Response } from 'express';
import { pool } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';

interface SearchUserError extends Error {
    statusCode?: number;
    message: string;
}

const router = express.Router();

router.get('/users/search`', asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.query;
    
    if (!username || typeof username !== 'string') {
        throw { 
            statusCode: 400, 
            message: 'Falta el nombre de usuario o formato inválido' 
        } as SearchUserError;
    }

    try {
        // Búsqueda parcial e insensible a mayúsculas/minúsculas
        const result = await pool.query(
            'SELECT id, nombre_publico FROM usuarios WHERE nombre_publico ILIKE $1',
            [`%${username}%`]
        );

        if (result.rows.length === 0) {
            throw { 
                statusCode: 404, 
                message: 'Usuario no encontrado' 
            } as SearchUserError;
        }

        res.json({
            success: true,
            user: result.rows[0]
        });
    } catch (error) {
        const typedError = error as SearchUserError;
        console.error('Error al buscar usuario:', typedError);
        
        res.status(typedError.statusCode || 500).json({
            success: false,
            message: typedError.message || 'Error al buscar usuario'
        });
    }
}));

export default router;
