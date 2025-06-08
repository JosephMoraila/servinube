import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../utils/asyncHandler';
import { fileTypeFromBuffer } from 'file-type';

const router = express.Router();

router.get('/preview', asyncHandler(async (req: Request, res: Response) => {
    const { fileName, folder, userId } = req.query;

    console.log('📥 Preview request received:', { fileName, folder, userId });

    if (!fileName || !userId) {
        console.log('❌ Missing required parameters');
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    try {
        const basePath = path.join(process.cwd(), 'src', 'uploads', userId.toString());
        console.log('📁 Base path for files:', basePath);
        console.log('📁 Current working directory:', process.cwd());
        const filePath = folder 
            ? path.join(basePath, folder.toString(), fileName.toString())
            : path.join(basePath, fileName.toString());

        console.log('🔍 Attempting to access file at:', filePath);

        // Verificar si el archivo existe
        if (!fs.existsSync(filePath)) {
            console.log('❌ File not found:', filePath);
            return res.status(404).send('File not found');
        }

        // Leer el archivo
        const fileContent = fs.readFileSync(filePath);
        
        // Intentar determinar el tipo MIME por el contenido del archivo
        let contentType = 'application/octet-stream';
        
        // Primero intentamos detectar el tipo por el contenido del archivo
        const fileType = await fileTypeFromBuffer(fileContent);
        if (fileType) {
            contentType = fileType.mime;
        } else {
            // Si no se puede detectar por contenido, intentamos por extensión
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes: { [key: string]: string } = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.pdf': 'application/pdf',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.txt': 'text/plain',
            };
            contentType = mimeTypes[ext] || contentType;
        }

        console.log('📋 Content-Type:', contentType);

        // Enviar la respuesta
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        res.send(fileContent);
        console.log('✅ File sent successfully');

    } catch (error) {
        console.error('❌ Error serving file:', error);
        res.status(500).send('Error serving file');
    }
}));

export default router;