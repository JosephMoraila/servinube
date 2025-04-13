import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import UPLOAD_DIRECTORY from '../utils/UPLOAD_DIRECTORY';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/restoreFile', asyncHandler(async (req: Request, res: Response) => {
    const { fileName, userId } = req.query;

    try {
        if (!fileName || !userId) {
            return res.status(400).json({ error: 'Faltan parámetros requeridos' });
        }

        const trashDir = path.join(UPLOAD_DIRECTORY, userId.toString(), '.trash');
        const trashPath = path.join(trashDir, fileName.toString());

        // Extraer información del nombre del archivo
        const [timestamp, originalPathAndName] = fileName.toString().split('_');
        const [originalPath, originalFileName] = originalPathAndName.split('__');

        // Reconstruir la ruta de destino
        const destinationPath = originalPath
            ? path.join(UPLOAD_DIRECTORY, userId.toString(), originalPath, originalFileName)
            : path.join(UPLOAD_DIRECTORY, userId.toString(), originalFileName);

        // Crear el directorio de destino si no existe
        await fs.mkdir(path.dirname(destinationPath), { recursive: true });

        // Mover el archivo de vuelta a su ubicación original
        await fs.rename(trashPath, destinationPath);

        res.json({ 
            message: 'Archivo restaurado correctamente',
            restoredTo: originalPath || 'raíz'
        });
    } catch (error) {
        console.error('Error al restaurar archivo:', error);
        res.status(500).json({ error: 'Error al restaurar archivo' });
    }
}));

export default router;