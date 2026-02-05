import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import CompanyProfile from '../models/CompanyProfile.js';
import jwt from 'jsonwebtoken';

export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      responsibilities,
      qualifications,
      jobType,
      location,
      salaryRange,
      remote,
      tags,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const job = await Job.create({
      title,
      description,
      company: req.user._id,
      responsibilities,
      qualifications,
      jobType,
      location,
      salaryRange,
      remote,
      tags,
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      jobType,
      location,
      remote,
      minSalary,
      maxSalary,
      tags,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const pipeline = [
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'company',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'companyprofiles',
          localField: 'company._id',
          foreignField: 'employer',
          as: 'companyProfile'
        }
      },
      { $unwind: { path: '$companyProfile', preserveNullAndEmptyArrays: true } },
    ];

    const searchRegex = search ? new RegExp(search, 'i') : null;
    if (searchRegex) {
      pipeline.push({
        $match: {
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { tags: searchRegex },
            { 'company.name': searchRegex }
          ]
        }
      });
    }

    if (jobType) pipeline.push({ $match: { jobType } });
    if (location) pipeline.push({ $match: { 'location.city': location } });
    if (remote === 'true') pipeline.push({ $match: { remote: true } });

    if (minSalary || maxSalary) {
      const salaryMatch = {};
      if (minSalary) salaryMatch['salaryRange.min'] = { $gte: parseInt(minSalary) };
      if (maxSalary) salaryMatch['salaryRange.max'] = { $lte: parseInt(maxSalary) };
      pipeline.push({ $match: salaryMatch });
    }

    if (tags) {
      pipeline.push({ $match: { tags: { $in: Array.isArray(tags) ? tags : [tags] } } });
    }

    const countPipeline = [...pipeline];
    const total = await Job.aggregate([...countPipeline, { $count: 'count' }]);
    const totalCount = total[0]?.count || 0;

    const sortMap = {};
    if (sort === '-createdAt') sortMap.createdAt = -1;
    else if (sort === 'createdAt') sortMap.createdAt = 1;
    else sortMap[sort] = -1;

    pipeline.push({ $sort: sortMap });
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit * 1 });
    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        company: { _id: 1, name: 1, email: 1, phone: 1, profileImage: 1 },
        companyName: '$companyProfile.companyName',
        companyProfileId: '$companyProfile._id',
        responsibilities: 1,
        qualifications: 1,
        jobType: 1,
        location: 1,
        salaryRange: 1,
        remote: 1,
        tags: 1,
        applicantCount: 1,
        views: 1,
        createdAt: 1,
        isActive: 1
      }
    });

    const jobs = await Job.aggregate(pipeline);

    res.status(200).json({
      success: true,
      jobs,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findByIdAndUpdate(
      jobId,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('company', 'name email phone company')
    .lean();

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job && job.company) {
      const companyProfile = await CompanyProfile.findOne({ 
        employer: job.company._id 
      }).lean();
      if (companyProfile) {
        job.companyName = companyProfile.companyName;
        job.companyProfileId = companyProfile._id;
        job.company.companyName = companyProfile.companyName;
        job.company.companyProfileId = companyProfile._id;
        job.company.employerId = job.company._id;
      }
    }

    let hasApplied = false;
    let userId = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user && user.role === 'jobSeeker') {
          userId = user._id;
          const existingApplication = await Application.findOne({
            job: jobId,
            applicant: userId,
          });
          hasApplied = !!existingApplication;
        }
      } catch (error) {
        console.error('Error verifying JWT:', error);
      }
    }

    res.status(200).json({
      success: true,
      job,
      hasApplied,
    });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(jobId, req.body, {
      new: true,
      runValidators: true,
    }).populate('company', 'name email phone company');

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(jobId);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployerJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const jobs = await Job.find({ company: req.user._id })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt')
      .lean();

    // Populate company name from company profile
    const companyProfile = await CompanyProfile.findOne({ employer: req.user._id }).lean();
    const jobsWithCompanyName = jobs.map(job => ({
      ...job,
      companyName: companyProfile?.companyName,
      companyProfileId: companyProfile?._id,
    }));

    const total = await Job.countDocuments({ company: req.user._id });

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

export const getJobStats = async (req, res, next) => {
  try {
    const stats = await Job.aggregate([
      {
        $group: {
          _id: '$jobType',
          count: { $sum: 1 },
          avgSalary: { $avg: '$salaryRange.min' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

export const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.savedJobs.includes(jobId)) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    user.savedJobs.push(jobId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Job saved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user.savedJobs.includes(jobId)) {
      return res.status(400).json({ message: 'Job not saved' });
    }

    user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Job unsaved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      populate: { path: 'company', select: 'name logo company' },
    });

    const savedJobs = user.savedJobs || [];
    
    // Populate company profile for each job
    const jobsWithCompanyName = await Promise.all(
      savedJobs.map(async (job) => {
        if (!job || !job.company) return job;
        const companyProfile = await CompanyProfile.findOne({ employer: job.company._id }).lean();
        return {
          ...job.toObject(),
          companyName: companyProfile?.companyName,
          companyProfileId: companyProfile?._id,
        };
      })
    );

    const paginatedJobs = jobsWithCompanyName.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      success: true,
      jobs: paginatedJobs,
      pagination: {
        total: jobsWithCompanyName.length,
        pages: Math.ceil(jobsWithCompanyName.length / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
};
