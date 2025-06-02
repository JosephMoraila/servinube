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
        console.log('❌ Error: Faltan parámetros', { fileName, userId });
        return res.status(400).json({ error: 'Faltan parámetros requeridos' });
      }

      console.log('📝 Iniciando proceso de eliminación:', {
        archivo: fileName,
        carpeta: folder || 'raíz',
        usuario: userId
      });

      // Crear directorio de papelera si no existe
      const trashDir = path.join(UPLOAD_DIRECTORY, userId.toString(), '.trash');
      await fs.mkdir(trashDir, { recursive: true });

      // Sanitizar el nombre del archivo reemplazando /, \, y _ con -
      const sanitizedFileName = fileName.toString().replace(/[/\\_]/g, '-');
      
      // Construir la ruta completa del archivo a eliminar
      // Si hay una carpeta especificada, el archivo está dentro de esa carpeta
      // Si no hay carpeta, el archivo está en la raíz del directorio del usuario
      const sourcePath = folder 
        ? path.join(UPLOAD_DIRECTORY, userId.toString(), folder.toString(), fileName.toString())
        : path.join(UPLOAD_DIRECTORY, userId.toString(), fileName.toString());
      console.log('📍 Ruta origen del archivo:', sourcePath);

      // Crear un nombre único para el archivo en la papelera
      // El formato es: timestamp_rutaOriginal__nombreArchivo
      // Esto nos permite:
      // 1. Evitar conflictos de nombres en la papelera
      // 2. Mantener la información de la ubicación original del archivo
      // 3. Facilitar la restauración posterior
      const originalPath = folder ? folder.toString().replace(/[/\\]/g, '_') : '';
      console.log('🔍 Carpeta original del archivo:', originalPath);
      const trashFileName = `${Date.now()}_${originalPath}_${sanitizedFileName}`;
      const trashPath = path.join(trashDir, trashFileName);
      console.log('🗑️ Nueva ruta en papelera:', trashPath);

      // Mover el archivo a la papelera
      console.log('🔄 Iniciando movimiento del archivo...');
      await fs.rename(sourcePath, trashPath);
      console.log('✅ Archivo movido exitosamente a la papelera');
      
      res.json({ 
        message: 'Archivo movido a papelera correctamente',
        originalPath: originalPath || 'raíz'
      });
    } catch (error) {
      console.error('❌ Error al mover archivo a papelera:', error);
      res.status(500).json({ error: 'Error al mover archivo a papelera' });
    }
}));

export default router;
