import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { sendApplicationNotification, sendStatusUpdateEmail } from '../utils/email.js';
import { notifyUser } from '../services/notificationService.js';

export const applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    let resumeData = null;
    if (req.file) {
      resumeData = {
        fileName: req.file.originalname,
      };
    } else if (req.user.resume) {
      resumeData = req.user.resume;
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      resume: resumeData,
    });

    await Job.findByIdAndUpdate(jobId, {
      $push: { applicants: application._id },
      $inc: { applicantCount: 1 },
    });

    const employer = await User.findById(job.company);
    await sendApplicationNotification(employer.email, job.title, req.user.name);

    notifyUser(job.company.toString(), 'newApplication', {
      jobId: job._id,
      jobTitle: job.title,
      applicantName: req.user.name,
      applicationId: application._id,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { applicant: req.user._id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name company email phone',
        },
      })
      .populate('applicant', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-appliedAt');

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      applications,
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

export const getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applicants' });
    }

    const query = { job: jobId };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('applicant', 'name email phone skills experience profileImage')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-appliedAt');

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      applications,
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

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await Application.findById(applicationId).populate('job').populate('applicant');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.job._id);
    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    application.updatedAt = Date.now();
    await application.save();

    await sendStatusUpdateEmail(application.applicant.email, application.job.title, status);

    notifyUser(application.applicant._id.toString(), 'applicationStatusUpdate', {
      jobTitle: application.job.title,
      status,
      applicationId: application._id,
    });

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate('job')
      .populate('applicant', 'name email phone skills experience profileImage')
      .populate('notes.by', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.job._id);
    if (job.company.toString() !== req.user._id.toString() && application.applicant._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const addApplicationNote = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { text } = req.body;

    const application = await Application.findById(applicationId).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.job._id);
    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.notes.push({
      by: req.user._id,
      text,
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationStats = async (req, res, next) => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const dailyStats = await Application.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats,
      dailyStats,
    });
  } catch (error) {
    next(error);
  }
};
