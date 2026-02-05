import express from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getJobStats,
  saveJob,
  unsaveJob,
  getSavedJobs,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('employer', 'admin'), createJob);
router.get('/', getJobs);
router.get('/stats', getJobStats);
router.get('/saved', protect, getSavedJobs);
router.get('/employer/my-jobs', protect, authorize('employer'), getEmployerJobs);
router.post('/:jobId/save', protect, authorize('jobSeeker'), saveJob);
router.delete('/:jobId/unsave', protect, authorize('jobSeeker'), unsaveJob);
router.get('/:jobId', getJobById);
router.put('/:jobId', protect, authorize('employer', 'admin'), updateJob);
router.delete('/:jobId', protect, authorize('employer', 'admin'), deleteJob);

export default router;
