import express from 'express';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { asyncHandler } from '../utils/asyncHandler';
import UPLOAD_DIRECTORY from '../utils/UPLOAD_DIRECTORY';

const router = express.Router();

// @route   DELETE /api/permanentDelete
// @desc    Elimina permanentemente un archivo de la papelera
// @access  Private
router.delete('/permanentDelete', asyncHandler(async (req: Request, res: Response) => {
    const { fileName, userId } = req.query;

    if (!fileName || !userId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Se requiere el nombre del archivo y el ID del usuario' 
        });
    }

    const trashPath = path.join(UPLOAD_DIRECTORY, userId.toString(), '.trash', fileName.toString());
    console.log(`Trashing file at path: ${trashPath}. fileName: ${fileName})`);

    // Verificar si el archivo existe
    if (!fs.existsSync(trashPath)) {
        return res.status(404).json({ 
            success: false, 
            message: 'Archivo no encontrado en la papelera' 
        });
    }

    try {
        // Eliminar el archivo
        fs.unlinkSync(trashPath);

        res.status(200).json({ 
            success: true, 
            message: 'Archivo eliminado permanentemente' 
        });
    } catch (error) {
        console.error('Error al eliminar el archivo:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar el archivo permanentemente' 
        });
    }
}));

export default router;