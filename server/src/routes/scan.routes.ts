import { Router } from 'express';
import * as scanController from '../controllers/scan.controller';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

// Route for scanning uploaded files
router.post('/files', uploadMiddleware, scanController.scanFiles);

// Route for checking scan status
router.get('/status/:scanId', scanController.getScanStatus);

export default router;
