import express from 'express';
import { getDashboardStats } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected route for dashboard metrics
router.get('/dashboard', protect, getDashboardStats);

export default router;
