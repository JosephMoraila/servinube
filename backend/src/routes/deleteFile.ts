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

    const filePath = folder 
      ? path.join(UPLOAD_DIRECTORY, userId.toString(), folder.toString(), fileName.toString())
      : path.join(UPLOAD_DIRECTORY, userId.toString(), fileName.toString());

    console.log(`Intentando eliminar archivo: ${filePath}`);
    console.log(`Solicitud realizada por usuario ID: ${userId}`);
    
    await fs.unlink(filePath);
    
    console.log(`Archivo eliminado exitosamente: ${filePath}`);
    console.log(`Detalles: { userId: ${userId}, fileName: ${fileName}, folder: ${folder || 'raíz'} }`);
    
    res.json({ message: 'Archivo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    console.error(`Detalles del error: { userId: ${userId}, fileName: ${fileName}, folder: ${folder || 'raíz'} }`);
    res.status(500).json({ error: 'Error al eliminar archivo' });
  }
})
);

export default router;
