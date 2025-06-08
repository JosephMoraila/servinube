import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import UPLOAD_DIRECTORY from '../utils/UPLOAD_DIRECTORY';
import { asyncHandler } from '../utils/asyncHandler';
import { fileTypeFromBuffer } from 'file-type';

const router = Router();

/**
 * Route handler for listing files in user's trash directory
 * GET /listTrash
 * 
 * @param {Request} req - Express request object with userId in query
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Returns list of files in trash or empty array
 */
router.get('/listTrash', asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.query;

    try {
        if (!userId) {
            console.log('❌ Error: Falta ID de usuario');
            return res.status(400).json({ error: 'Falta el ID de usuario' });
        }

        console.log('📝 Iniciando listado de papelera para usuario:', userId);
        const trashDir = path.join(UPLOAD_DIRECTORY, userId.toString(), '.trash');
        console.log('📂 Directorio de papelera:', trashDir);
        
        try {
            const files = await fs.readdir(trashDir);
            console.log('✅ Archivos encontrados en papelera:', files.length);
            
            const filesInfo = await Promise.all(files.map(async (file) => {
                const filePath = path.join(trashDir, file);
                const stats = await fs.stat(filePath);
                
                // Determinar el tipo MIME para archivos
                let mimeType = null;
                if (!stats.isDirectory()) {
                    try {
                        const fileBuffer = await fs.readFile(filePath);
                        const type = await fileTypeFromBuffer(fileBuffer);
                        if (type) {
                            mimeType = type.mime;
                        }
                    } catch (error) {
                        console.warn(`No se pudo determinar el tipo de archivo para ${file}`);
                    }
                }

                return {
                    name: file,
                    isDirectory: stats.isDirectory(),
                    size: stats.size,
                    createdAt: stats.birthtime,
                    mimeType: stats.isDirectory() ? null : (mimeType || 'application/octet-stream')
                };
            }));
            
            console.log('📄 Lista de archivos:', filesInfo);
            res.json({ files: filesInfo });
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                console.log('ℹ️ Papelera vacía o no existe para usuario:', userId);
                res.json({ files: [] });
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('❌ Error al listar papelera:', error);
        res.status(500).json({ error: 'Error al listar archivos de la papelera' });
    }
}));

export default router;