import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

export const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      jobSeekers,
      employers,
      totalJobs,
      totalApplications,
      jobsByType,
      applicationsByStatus,
      dailyApplications,
      newUsersLastWeek,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'jobSeeker' }),
      User.countDocuments({ role: 'employer' }),
      Job.countDocuments(),
      Application.countDocuments(),
      Job.aggregate([
        { $group: { _id: '$jobType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Application.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        jobSeekers,
        employers,
        totalJobs,
        totalApplications,
        jobsByType,
        applicationsByStatus,
        dailyApplications,
        newUsersLastWeek,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .select('_id title companyName location jobType applicantCount createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicantCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      jobs: jobsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminSettings = async (req, res, next) => {
  try {
    // Return default settings for now (can be extended with a Settings model later)
    const settings = {
      siteTitle: process.env.SITE_TITLE || 'CareerConnect',
      siteDescription: process.env.SITE_DESCRIPTION || 'Your Gateway to Dream Jobs',
      maintenanceMode: false,
      maxJobsPerEmployer: 50,
      applicationFeeWaived: true,
    };

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminSettings = async (req, res, next) => {
  try {
    const { siteTitle, siteDescription, maintenanceMode, maxJobsPerEmployer } = req.body;

    // In a real app, save these to a database or config store
    // For now, return success
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        siteTitle: siteTitle || process.env.SITE_TITLE,
        siteDescription: siteDescription || process.env.SITE_DESCRIPTION,
        maintenanceMode,
        maxJobsPerEmployer,
      },
    });
  } catch (error) {
    next(error);
  }
};
