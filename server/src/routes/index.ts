import { Router } from 'express';
import scanRoutes from './scan.routes';

const router = Router();

// Register API routes
router.use('/scan', scanRoutes);

// API Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'KubeFortress Rules Checker API is operational',
    timestamp: new Date().toISOString()
  });
});

export default router;
