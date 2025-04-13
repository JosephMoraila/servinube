import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import UPLOAD_DIRECTORY from '../utils/UPLOAD_DIRECTORY';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * GET /download - Download a file
 * @route GET /download
 * @param {string} req.query.fileName - Name of the file to download
 * @param {string} req.query.folder - Current folder path
 * @param {string} req.query.userId - User ID
 */
router.get("/download", asyncHandler(async (req: Request, res: Response) => {
  console.log("📥 Iniciando descarga...");
  console.log("📋 Query params:", req.query);

  const { fileName, folder, userId } = req.query;

  if (!fileName || !userId) {
    return res.status(400).json({
      success: false,
      message: "Se requiere nombre de archivo y ID de usuario"
    });
  }

  try {
    // Construct the file path
    const filePath = path.join(
      UPLOAD_DIRECTORY,
      userId.toString(),
      folder?.toString() || '',
      fileName.toString()
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error("❌ Archivo no encontrado:", filePath);
      return res.status(404).json({
        success: false,
        message: "Archivo no encontrado"
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName.toString())}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    console.log("✅ Archivo enviado:", fileName);
  } catch (error) {
    console.error("❌ Error al descargar archivo:", error);
    res.status(500).json({
      success: false,
      message: "Error al descargar el archivo"
    });
  }
}));

export default router;