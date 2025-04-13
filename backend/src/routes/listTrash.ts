import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import UPLOAD_DIRECTORY from '../utils/UPLOAD_DIRECTORY';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/listTrash', asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.query;

    try {
        if (!userId) {
            return res.status(400).json({ error: 'Falta el ID de usuario' });
        }

        const trashDir = path.join(UPLOAD_DIRECTORY, userId.toString(), '.trash');
        
        try {
            const files = await fs.readdir(trashDir);
            console.log('Archivos en la papelera:', files);
            res.json({ files });
        } catch (error) {
            // Si el directorio no existe, devolver una lista vacía
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                res.json({ files: [] });
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error al listar archivos de la papelera:', error);
        res.status(500).json({ error: 'Error al listar archivos de la papelera' });
    }
}));

export default router;