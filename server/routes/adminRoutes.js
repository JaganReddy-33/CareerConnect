import express from 'express';
import { getPlatformStats, getAdminJobs, getAdminSettings, updateAdminSettings } from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getPlatformStats);
router.get('/jobs', protect, authorize('admin'), getAdminJobs);
router.get('/settings', protect, authorize('admin'), getAdminSettings);
router.post('/settings', protect, authorize('admin'), updateAdminSettings);

export default router;
