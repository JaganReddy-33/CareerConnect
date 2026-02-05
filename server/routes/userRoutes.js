import express from 'express';
import {
  getProfile,
  updateProfile,
  saveJob,
  unsaveJob,
  getSavedJobs,
  getAllUsers,
  deleteUser,
  getUserById,
  downloadResume,
} from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'profileImage', maxCount: 1 }]), updateProfile);
router.post('/save-job', protect, saveJob);
router.post('/unsave-job', protect, unsaveJob);
router.get('/saved-jobs', protect, getSavedJobs);
router.get('/all', protect, authorize('admin'), getAllUsers);
router.delete('/:userId', protect, authorize('admin'), deleteUser);
router.get('/:userId/resume/download', protect, downloadResume);
router.get('/:userId', getUserById);

export default router;
