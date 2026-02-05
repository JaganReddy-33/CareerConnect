import express from 'express';
import {
  createCompanyProfile,
  getCompanyProfile,
  updateCompanyProfile,
  getMyCompanyProfile,
  addCompanyReview,
  getCompanyReviews,
  updateCompanyReview,
  deleteCompanyReview,
} from '../controllers/companyController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.post('/', protect, authorize('employer'), upload.single('logo'), createCompanyProfile);
router.get('/my-profile', protect, authorize('employer'), getMyCompanyProfile);
router.put('/', protect, authorize('employer'), upload.single('logo'), updateCompanyProfile);
router.get('/by-employer/:employerId', getCompanyProfile);
router.get('/:companyId', getCompanyProfile);
router.get('/:companyId/reviews', getCompanyReviews);
router.post('/:companyId/reviews', protect, addCompanyReview);
router.put('/:companyId/reviews/:reviewId', protect, updateCompanyReview);
router.delete('/:companyId/reviews/:reviewId', protect, deleteCompanyReview);

export default router;
