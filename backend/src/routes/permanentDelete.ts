import express from 'express';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { asyncHandler } from '../utils/asyncHandler';
import UPLOAD_DIRECTORY from '../utils/UPLOAD_DIRECTORY';

const router = express.Router();

// Función recursiva para eliminar carpeta y su contenido
const deleteFolderRecursive = (folderPath: string) => {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file) => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                // Recursivamente eliminar subcarpetas
                deleteFolderRecursive(curPath);
            } else {
                // Eliminar archivo
                fs.unlinkSync(curPath);
            }
        });
        // Eliminar la carpeta vacía
        fs.rmdirSync(folderPath);
    }
};

// @route   DELETE /api/permanentDelete
// @desc    Elimina permanentemente un archivo o carpeta de la papelera
// @access  Private
router.delete('/permanentDelete', asyncHandler(async (req: Request, res: Response) => {
    const { fileName, userId } = req.query;

    if (!fileName || !userId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Se requiere el nombre del archivo/carpeta y el ID del usuario' 
        });
    }

    const trashPath = path.join(UPLOAD_DIRECTORY, userId.toString(), '.trash', fileName.toString());
    console.log(`Eliminando elemento en: ${trashPath}. Nombre: ${fileName})`);

    // Verificar si el elemento existe
    if (!fs.existsSync(trashPath)) {
        return res.status(404).json({ 
            success: false, 
            message: 'Elemento no encontrado en la papelera' 
        });
    }

    try {
        const stats = fs.lstatSync(trashPath);
        
        if (stats.isDirectory()) {
            // Si es una carpeta, eliminarla recursivamente
            deleteFolderRecursive(trashPath);
            res.status(200).json({ 
                success: true, 
                message: 'Carpeta eliminada permanentemente' 
            });
        } else {
            // Si es un archivo, eliminarlo
            fs.unlinkSync(trashPath);
            res.status(200).json({ 
                success: true, 
                message: 'Archivo eliminado permanentemente' 
            });
        }
    } catch (error) {
        console.error('Error al eliminar el elemento:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar el elemento permanentemente' 
        });
    }
}));

export default router;