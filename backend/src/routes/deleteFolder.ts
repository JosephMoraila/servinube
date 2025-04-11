import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.delete('/deleteFolder', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, folder, userId } = req.query;
    if (!userId || !name) {
      return res.status(400).send('Missing required parameters');
    }

    const userFolder = path.join(process.cwd(), 'src', 'uploads', userId.toString());
    console.log(`User folder: ${userFolder}`);

    const trashFolder = path.join(userFolder, '.trash');
    console.log(`Trash folder: ${trashFolder}`);
    
    const sourcePath = folder 
      ? path.join(userFolder, folder as string, name as string)
      : path.join(userFolder, name as string);

      console.log(`Source path: ${sourcePath}`);
    
    // Create trash folder if it doesn't exist
    if (!fs.existsSync(trashFolder)) {
      fs.mkdirSync(trashFolder, { recursive: true });
    }

    // Generate unique name for trash
    const timestamp = new Date().getTime();
    const trashPath = path.join(trashFolder, `${name}`);

    console.log(`Trash path: ${trashPath}`);

    // Move folder to trash
    fs.renameSync(sourcePath, trashPath);

    res.status(200).send('Folder moved to trash');
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).send('Error deleting folder');
  }
})
);


export default router;
