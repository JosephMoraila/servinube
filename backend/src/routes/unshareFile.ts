import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/**
 * @route POST /api/unshare-file
 * @description Dejar de compartir un archivo con múltiples usuarios
 * @access Private
 */
router.post("/unshare-file", asyncHandler(async (req: Request, res: Response) => {
  const { file_path, ownerId, userIdsToRemove } = req.body;

  if (!file_path || !ownerId || !Array.isArray(userIdsToRemove)) {
    return res.status(400).json({
      success: false,
      message: "Se requiere file_path, ownerId y un array de userIdsToRemove"
    });
  }

  try {
    const result = await pool.query(
      `
        DELETE FROM shared_files 
        WHERE file_path = $1 
        AND owner_id = $2
        AND shared_with_id = ANY($3)
        RETURNING id
      `,
      [file_path, ownerId, userIdsToRemove]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron registros para eliminar"
      });
    }

    res.json({
      success: true,
      message: `Archivo dejado de compartir con ${result.rowCount} usuario(s)`
    });
  } catch (error) {
    console.error("❌ Error al dejar de compartir:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la eliminación de usuarios compartidos"
    });
  }
}));

router.delete("/unshare-file-everyone", asyncHandler(async (req: Request, res: Response) => {
    const { filePath, userId } = req.query;

    if (!filePath || !userId) {
        return res.status(400).json({
            success: false,
            message: "Se requiere la ruta del archivo y el ID del usuario"
        });
    }

    try {
        // Verify ownership and delete share records
        const result = await pool.query(
            `DELETE FROM shared_files 
             WHERE file_path = $1 
             AND owner_id = $2 
             RETURNING id`,
            [filePath, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No se encontró el registro de compartición o no eres el propietario"
            });
        }

        res.json({
            success: true,
            message: "Archivo dejado de compartir exitosamente"
        });
    } catch (error) {
        console.error("Error al dejar de compartir:", error);
        res.status(500).json({
            success: false,
            message: "Error al dejar de compartir el archivo"
        });
    }
}));


export default router;
