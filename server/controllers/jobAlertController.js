import JobAlert from '../models/JobAlert.js';
import Job from '../models/Job.js';
import CompanyProfile from '../models/CompanyProfile.js';

export const createJobAlert = async (req, res, next) => {
  try {
    const { keywords, jobType, location, minSalary, maxSalary, remote, frequency } = req.body;

    const alert = await JobAlert.create({
      user: req.user._id,
      keywords,
      jobType,
      location,
      minSalary,
      maxSalary,
      remote,
      frequency: frequency || 'weekly',
    });

    res.status(201).json({
      success: true,
      message: 'Job alert created successfully',
      alert,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAlerts = async (req, res, next) => {
  try {
    const alerts = await JobAlert.find({ user: req.user._id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

export const updateJobAlert = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const updates = req.body;

    const alert = await JobAlert.findByIdAndUpdate(
      alertId,
      updates,
      { new: true, runValidators: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    if (alert.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      message: 'Alert updated successfully',
      alert,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJobAlert = async (req, res, next) => {
  try {
    const { alertId } = req.params;

    const alert = await JobAlert.findById(alertId);

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    if (alert.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await JobAlert.findByIdAndDelete(alertId);

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendedJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const userAlerts = await JobAlert.find({ user: req.user._id });

    if (userAlerts.length === 0) {
      const jobs = await Job.find({ isActive: true })
        .populate('company', 'name logo')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort('-createdAt')
        .lean();

      // Populate company profile for each job
      const jobsWithCompanyName = await Promise.all(
        jobs.map(async (job) => {
          if (!job.company) return job;
          const companyProfile = await CompanyProfile.findOne({ employer: job.company._id }).lean();
          return {
            ...job,
            companyName: companyProfile?.companyName,
            companyProfileId: companyProfile?._id,
          };
        })
      );

      const total = await Job.countDocuments({ isActive: true });

      return res.status(200).json({
        success: true,
        jobs: jobsWithCompanyName,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
        },
      });
    }

    const query = { $or: [] };

    userAlerts.forEach((alert) => {
      const alertQuery = {};

      if (alert.keywords && alert.keywords.length > 0) {
        alertQuery.$or = [
          { title: { $regex: alert.keywords.join('|'), $options: 'i' } },
          { description: { $regex: alert.keywords.join('|'), $options: 'i' } },
        ];
      }

      if (alert.jobType && alert.jobType.length > 0) {
        alertQuery.jobType = { $in: alert.jobType };
      }

      if (alert.location) {
        alertQuery['location.city'] = { $regex: alert.location, $options: 'i' };
      }

      if (alert.minSalary) {
        alertQuery.salaryMax = { $gte: alert.minSalary };
      }

      if (alert.maxSalary) {
        alertQuery.salaryMin = { $lte: alert.maxSalary };
      }

      if (alert.remote) {
        alertQuery.remote = true;
      }

      query.$or.push(alertQuery);
    });

    const jobs = await Job.find({ ...query, isActive: true })
      .populate('company', 'name logo')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt')
      .lean();

    // Populate company profile for each job
    const jobsWithCompanyName = await Promise.all(
      jobs.map(async (job) => {
        if (!job.company) return job;
        const companyProfile = await CompanyProfile.findOne({ employer: job.company._id }).lean();
        return {
          ...job,
          companyName: companyProfile?.companyName,
          companyProfileId: companyProfile?._id,
        };
      })
    );

    const total = await Job.countDocuments({ ...query, isActive: true });

    res.status(200).json({
      success: true,
      jobs: jobsWithCompanyName,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
};
