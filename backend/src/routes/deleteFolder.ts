import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs-extra';
import { asyncHandler } from '../utils/asyncHandler';
import UPLOAD_DIRECTORY from '../utils/UPLOAD_DIRECTORY';

/**
 * Router for handling folder deletion operations
 * Instead of permanent deletion, folders are moved to a .trash directory
 * Format for trash folder names: timestamp_originalPath_folderName
 */
const router = Router();

/**
 * Delete folder endpoint
 * @param {string} name - Name of the folder to delete
 * @param {string} folder - Parent folder path (optional)
 * @param {string} userId - User identifier
 */
router.delete('/deleteFolder', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, folder, userId } = req.query;
    
    // Log operation start
    console.log('📝 Iniciando proceso de eliminación de carpeta:', {
      carpeta: name,
      ubicación: folder || 'raíz',
      usuario: userId
    });

    // Validate required parameters
    if (!userId || !name) {
      console.log('❌ Error: Faltan parámetros requeridos:', { userId, name });
      return res.status(400).send('Missing required parameters');
    }

    // Build paths for user directory and trash folder
    const userFolder = path.join(UPLOAD_DIRECTORY, userId.toString());
    const trashDir = path.join(userFolder, '.trash');
    
    // Sanitizar el nombre de la carpeta reemplazando /, \, y _ con -
    const sanitizedFolderName = name.toString().replace(/[/\\_]/g, '-');

    // Construir la ruta completa de la carpeta a eliminar
    const sourcePath = folder 
      ? path.join(userFolder, folder.toString(), name.toString())
      : path.join(userFolder, name.toString());
    console.log('📍 Ruta origen de la carpeta:', sourcePath);

    // Verificar que la carpeta existe
    if (!await fs.pathExists(sourcePath)) {
      console.log('❌ Error: La carpeta no existe:', sourcePath);
      return res.status(404).send('Folder not found');
    }

    // Verificar que es una carpeta
    const stats = await fs.stat(sourcePath);
    if (!stats.isDirectory()) {
      console.log('❌ Error: No es una carpeta:', sourcePath);
      return res.status(400).send('Not a folder');
    }

    // Crear directorio de papelera si no existe
    if (!await fs.pathExists(trashDir)) {
      console.log('📁 Creando directorio de papelera...');
      await fs.mkdir(trashDir, { recursive: true });
    }

    // Crear un nombre único para la carpeta en la papelera
    // El formato es: timestamp_rutaOriginal_nombreCarpeta
    const originalPath = folder ? folder.toString().replace(/[/\\]/g, '_') : '';
    console.log('🔍 Carpeta original:', originalPath);
    const trashFolderName = `${Date.now()}_${originalPath}_${sanitizedFolderName}`;
    const trashPath = path.join(trashDir, trashFolderName);
    console.log('🗑️ Nueva ruta en papelera:', trashPath);

    try {
      // Mover la carpeta a la papelera
      console.log('🔄 Iniciando movimiento de la carpeta...');
      await fs.move(sourcePath, trashPath, { overwrite: true });
      console.log('✅ Carpeta movida exitosamente a la papelera');
      
      res.json({ 
        message: 'Carpeta movida a papelera correctamente',
        originalPath: originalPath || 'raíz'
      });
    } catch (moveError) {
      console.error('❌ Error específico al mover:', moveError);
      // Método alternativo: copiar y eliminar si falla el movimiento
      try {
        await fs.copy(sourcePath, trashPath);
        await fs.remove(sourcePath);
        console.log('✅ Carpeta copiada y eliminada exitosamente');
        res.json({ 
          message: 'Carpeta movida a papelera correctamente',
          originalPath: originalPath || 'raíz'
        });
      } catch (fallbackError) {
        console.error('❌ Error en el método alternativo:', fallbackError);
        throw fallbackError;
      }
    }
  } catch (error) {
    console.error('❌ Error al mover carpeta a papelera:', error);
    res.status(500).json({ error: 'Error al mover carpeta a papelera' });
  }
}));

export default router;
