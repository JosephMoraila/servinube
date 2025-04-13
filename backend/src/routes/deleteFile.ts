import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import UPLOAD_DIRECTORY from '../utils/UPLOAD_DIRECTORY';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.delete('/deleteFile', asyncHandler(async (req: Request, res: Response) => {
    const { fileName, folder, userId } = req.query;
    try {
      if (!fileName || !userId) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos' });
      }

      // Crear directorio de papelera si no existe
      const trashDir = path.join(UPLOAD_DIRECTORY, userId.toString(), '.trash');
      await fs.mkdir(trashDir, { recursive: true });

      const sourcePath = folder 
        ? path.join(UPLOAD_DIRECTORY, userId.toString(), folder.toString(), fileName.toString())
        : path.join(UPLOAD_DIRECTORY, userId.toString(), fileName.toString());

      // Crear un nombre único para el archivo en la papelera que incluya la ruta original
      const originalPath = folder ? folder.toString() : '';
      const trashFileName = `${Date.now()}_${originalPath}__${fileName.toString()}`;
      const trashPath = path.join(trashDir, trashFileName);

      console.log(`Moviendo archivo a papelera: ${sourcePath} -> ${trashPath}`);
      
      await fs.rename(sourcePath, trashPath);
      
      console.log(`Archivo movido a papelera exitosamente`);
      
      res.json({ 
        message: 'Archivo movido a papelera correctamente',
        originalPath: originalPath || 'raíz'
      });
    } catch (error) {
      console.error('Error al mover archivo a papelera:', error);
      res.status(500).json({ error: 'Error al mover archivo a papelera' });
    }
}));

export default router;
