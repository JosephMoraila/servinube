import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import UPLOAD_DIRECTORY from '../utils/UPLOAD_DIRECTORY';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Router para manejar la restauración de archivos desde la papelera
 * Este módulo proporciona funcionalidad para:
 * - Restaurar archivos desde la papelera a su ubicación original
 * - Recrear la estructura de directorios si es necesario
 * - Manejar errores y casos extremos
 */
const router = Router();

/**
 * @route   POST /api/restoreFile
 * @desc    Restaura un archivo desde la papelera a su ubicación original
 * @param   {string} fileName - Nombre del archivo en la papelera (formato: timestamp_rutaOriginal_nombreArchivo)
 * @param   {string} userId - ID del usuario propietario del archivo
 * @returns {object} Mensaje de éxito o error y la ruta donde se restauró
 * @access  Private
 */
router.post('/restoreFile', asyncHandler(async (req: Request, res: Response) => {
    console.log('📥 Iniciando proceso de restauración de archivo');
    const { fileName, userId } = req.query;

    try {
        if (!fileName || !userId) {
            console.log('❌ Error: Faltan parámetros requeridos', { fileName, userId });
            return res.status(400).json({ error: 'Faltan parámetros requeridos' });
        }

        console.log('🔍 Parámetros recibidos:', { fileName, userId });

        const trashDir = path.join(UPLOAD_DIRECTORY, userId.toString(), '.trash');
        const trashPath = path.join(trashDir, fileName.toString());
        console.log('📂 Ruta en papelera:', trashPath);

        // Extraer información del nombre del archivo usando la misma lógica que en Trash.tsx
        const parts = fileName.toString().split('_');
        const timestamp = parts[0];
        const displayName = parts[parts.length - 1];
        const originalPath = parts.slice(1, -1).join('/');
        console.log('📝 Información extraída:', { timestamp, displayName, originalPath });

        // Reconstruir la ruta de destino
        const destinationPath = originalPath
            ? path.join(UPLOAD_DIRECTORY, userId.toString(), originalPath, displayName)
            : path.join(UPLOAD_DIRECTORY, userId.toString(), displayName);
        console.log('🎯 Ruta de destino:', destinationPath);

        // Verificar si el archivo existe en la papelera
        try {
            await fs.access(trashPath);
            console.log('✅ Archivo encontrado en la papelera');
        } catch (error) {
            console.log('❌ Error: Archivo no encontrado en la papelera');
            return res.status(404).json({ error: 'Archivo no encontrado en la papelera' });
        }

        // Crear el directorio de destino si no existe
        console.log('📁 Creando directorio de destino si no existe');
        await fs.mkdir(path.dirname(destinationPath), { recursive: true });

        // Verificar si ya existe un archivo en la ruta de destino
        try {
            await fs.access(destinationPath);
            console.log('⚠️ Ya existe un archivo en la ruta de destino');
            return res.status(409).json({ error: 'Ya existe un archivo/carpeta con ese nombre en la ruta donde fue eliminado.\nPrueba cambiar de nombre al archivo tu unidad.' });
        } catch {
            // Si no existe, podemos continuar
            console.log('✅ La ruta de destino está libre');
        }

        // Mover el archivo de vuelta a su ubicación original
        console.log('🔄 Moviendo archivo a su ubicación original');
        await fs.rename(trashPath, destinationPath);

        console.log('✨ Archivo restaurado exitosamente');
        res.json({ 
            message: 'Archivo restaurado correctamente',
            restoredTo: originalPath || 'raíz'
        });
    } catch (error) {
        console.error('❌ Error al restaurar archivo:', error);
        res.status(500).json({ error: 'Error al restaurar archivo' });
    }
}));

export default router;