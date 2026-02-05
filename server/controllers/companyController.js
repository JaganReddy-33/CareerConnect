import CompanyProfile from '../models/CompanyProfile.js';
import Job from '../models/Job.js';

export const createCompanyProfile = async (req, res, next) => {
  try {
    const { companyName, industry, companySize, website, description, foundedYear } = req.body;
    
    let location = {};
    if (req.body['location[city]']) location.city = req.body['location[city]'];
    if (req.body['location[country]']) location.country = req.body['location[country]'];
    if (req.body['location[headquarters]']) location.headquarters = req.body['location[headquarters]'];

    let socialLinks = {};
    if (req.body['socialLinks[linkedin]']) socialLinks.linkedin = req.body['socialLinks[linkedin]'];
    if (req.body['socialLinks[twitter]']) socialLinks.twitter = req.body['socialLinks[twitter]'];
    if (req.body['socialLinks[facebook]']) socialLinks.facebook = req.body['socialLinks[facebook]'];

    const existingProfile = await CompanyProfile.findOne({ employer: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Company profile already exists' });
    }

    const profileData = {
      employer: req.user._id,
      companyName,
      industry,
      companySize,
      website,
      description,
      location: Object.keys(location).length > 0 ? location : undefined,
      foundedYear,
      socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
    };

    if (req.file) {
      profileData.logo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const profile = await CompanyProfile.create(profileData);

    res.status(201).json({
      success: true,
      message: 'Company profile created successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyProfile = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    let profile = await CompanyProfile.findById(companyId)
      .populate('employer', 'email phone')
      .populate('reviews.reviewer', 'name profileImage');

    if (!profile) {
      profile = await CompanyProfile.findOne({ employer: companyId })
        .populate('employer', 'email phone')
        .populate('reviews.reviewer', 'name profileImage');
    }

    if (!profile) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const jobs = await Job.find({ company: profile.employer._id, isActive: true }).select('title jobType location salaryRange');

    res.status(200).json({
      success: true,
      profile,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompanyProfile = async (req, res, next) => {
  try {
    const profile = await CompanyProfile.findOne({ employer: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.logo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const updated = await CompanyProfile.findByIdAndUpdate(profile._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyCompanyProfile = async (req, res, next) => {
  try {
    const profile = await CompanyProfile.findOne({ employer: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const stats = await Job.aggregate([
      { $match: { company: req.user._id } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: { $sum: { $cond: ['$isActive', 1, 0] } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      profile,
      stats: stats[0] || { totalJobs: 0, activeJobs: 0 },
    });
  } catch (error) {
    next(error);
  }
};

export const addCompanyReview = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    const profile = await CompanyProfile.findById(companyId);
    if (!profile) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if user already reviewed
    const existingReview = profile.reviews.find(
      r => r.reviewer && r.reviewer.toString() === req.user._id.toString()
    );
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this company' });
    }

    const review = {
      reviewer: req.user._id,
      rating: parseInt(rating),
      title: title || '',
      comment,
      createdAt: new Date(),
    };

    profile.reviews.push(review);
    const totalRating = profile.reviews.reduce((sum, r) => sum + r.rating, 0);
    profile.ratings = totalRating / profile.reviews.length;

    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyReviews = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    let profile = await CompanyProfile.findById(companyId)
      .populate('reviews.reviewer', 'name profileImage')
      .select('reviews ratings');

    if (!profile) {
      // Try finding by employer ID
      profile = await CompanyProfile.findOne({ employer: companyId })
        .populate('reviews.reviewer', 'name profileImage')
        .select('reviews ratings');
    }

    if (!profile) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({
      success: true,
      reviews: profile.reviews || [],
      ratings: profile.ratings || 0,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompanyReview = async (req, res, next) => {
  try {
    const { companyId, reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const profile = await CompanyProfile.findById(companyId);
    if (!profile) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const review = profile.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review.rating = rating ?? review.rating;
    review.title = title ?? review.title;
    review.comment = comment ?? review.comment;

    const totalRating = profile.reviews.reduce((sum, r) => sum + r.rating, 0);
    profile.ratings = totalRating / profile.reviews.length;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCompanyReview = async (req, res, next) => {
  try {
    const { companyId, reviewId } = req.params;

    const profile = await CompanyProfile.findById(companyId);
    if (!profile) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const review = profile.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    profile.reviews.id(reviewId).deleteOne();

    if (profile.reviews.length > 0) {
      const totalRating = profile.reviews.reduce((sum, r) => sum + r.rating, 0);
      profile.ratings = totalRating / profile.reviews.length;
    } else {
      profile.ratings = 0;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};
