import express from 'express';
import {
  applyForJob,
  getApplications,
  getJobApplicants,
  updateApplicationStatus,
  getApplicationById,
  addApplicationNote,
  getApplicationStats,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.post('/:jobId/apply', protect, authorize('jobSeeker'), upload.single('resume'), applyForJob);
router.get('/', protect, authorize('jobSeeker'), getApplications);
router.get('/:jobId/applicants', protect, authorize('employer'), getJobApplicants);
router.put('/:applicationId/status', protect, authorize('employer'), updateApplicationStatus);
router.get('/stats', protect, authorize('admin', 'employer'), getApplicationStats);
router.get('/:applicationId', protect, getApplicationById);
router.post('/:applicationId/note', protect, authorize('employer'), addApplicationNote);

export default router;
