import express from 'express';
import {
  createJobAlert,
  getMyAlerts,
  updateJobAlert,
  deleteJobAlert,
  getRecommendedJobs,
} from '../controllers/jobAlertController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createJobAlert);
router.get('/', getMyAlerts);
router.get('/recommended', getRecommendedJobs);
router.put('/:alertId', updateJobAlert);
router.delete('/:alertId', deleteJobAlert);

export default router;
