import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs-extra'; // Cambiar a fs-extra
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Router para manejar la eliminación de carpetas
 * Las carpetas eliminadas se mueven a una carpeta .trash en lugar de eliminarse permanentemente
 */
const router = Router();

router.delete('/deleteFolder', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, folder, userId } = req.query;
    console.log('📝 Iniciando proceso de eliminación de carpeta:', {
      carpeta: name,
      ubicación: folder || '',
      usuario: userId
    });

    if (!userId || !name) {
      console.log('❌ Error: Faltan parámetros requeridos:', { userId, name });
      return res.status(400).send('Missing required parameters');
    }

    const userFolder = path.join(process.cwd(), 'src', 'uploads', userId.toString());
    const trashFolder = path.join(userFolder, '.trash');
    const sourcePath = folder 
      ? path.join(userFolder, folder as string, name as string)
      : path.join(userFolder, name as string);

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

    // Crear carpeta de papelera con permisos recursivos
    if (!await fs.pathExists(trashFolder)) {
      console.log('📁 Creando directorio de papelera...');
      await fs.mkdir(trashFolder, { recursive: true, mode: 0o777 });
      // Asegurar permisos recursivos en la carpeta .trash
      await fs.chmod(trashFolder, 0o777);
    }

    const timestamp = new Date().getTime();
    const trashPath = path.join(trashFolder, `${name}_${timestamp}`);

    try {
      // Asegurar permisos en la carpeta fuente antes de moverla
      await fs.chmod(sourcePath, 0o777);
      
      // Usar move de fs-extra en lugar de renameSync
      await fs.move(sourcePath, trashPath, { overwrite: true });
      console.log('✅ Carpeta movida exitosamente a la papelera');
      
      res.status(200).send('Folder moved to trash');
    } catch (moveError) {
      console.error('❌ Error específico al mover:', moveError);
      // Intento alternativo usando copy+remove
      try {
        await fs.copy(sourcePath, trashPath);
        await fs.remove(sourcePath);
        console.log('✅ Carpeta copiada y eliminada exitosamente');
        res.status(200).send('Folder moved to trash');
      } catch (fallbackError) {
        console.error('❌ Error en el método alternativo:', fallbackError);
        throw fallbackError;
      }
    }
  } catch (error) {
    console.error('❌ Error al mover carpeta a papelera:', error);
    res.status(500).send('Error deleting folder');
  }
}));

export default router;
