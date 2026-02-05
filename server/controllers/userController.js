import User from '../models/User.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedJobs');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location, bio, skills, experience, company, socialLinks } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (bio) updateData.bio = bio;
    if (skills) updateData.skills = skills;
    if (experience) updateData.experience = experience;
    if (company) updateData.company = company;
    if (socialLinks) updateData.socialLinks = socialLinks;

    // Handle file uploads - support both single file and multiple files
    if (req.files) {
      if (req.files.profileImage && req.files.profileImage[0]) {
        const profileImageFile = req.files.profileImage[0];
        updateData.profileImage = `data:${profileImageFile.mimetype};base64,${profileImageFile.buffer.toString('base64')}`;
      }
      if (req.files.resume && req.files.resume[0]) {
        const resumeFile = req.files.resume[0];
        updateData.resume = {
          fileName: resumeFile.originalname,
          mimeType: resumeFile.mimetype,
          data: resumeFile.buffer,
          uploadedAt: new Date(),
        };
      }
    } else if (req.file) {
      // Fallback for single file upload
      if (req.file.mimetype.startsWith('image/')) {
        updateData.profileImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      } else {
        updateData.resume = {
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          data: req.file.buffer,
          uploadedAt: new Date(),
        };
      }
    }
    
    if (req.body.resume === null || req.body.resume === 'null') {
      updateData.resume = null;
    }
    
    if (req.body.profileImage === null || req.body.profileImage === 'null') {
      updateData.profileImage = null;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadResume = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Allow users to download their own resume, or employers/admins to download any resume
    if (req.user._id.toString() !== userId && req.user.role !== 'employer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to download this resume' });
    }

    const user = await User.findById(userId).select('resume name');
    if (!user || !user.resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const resume = user.resume;
    
    if (!resume.data) {
      return res.status(404).json({ message: 'Resume file not found' });
    }

    // Convert buffer to proper format
    const buffer = Buffer.isBuffer(resume.data) ? resume.data : Buffer.from(resume.data);
    
    // Set proper headers
    res.setHeader('Content-Type', resume.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.fileName || `${user.name || 'resume'}_resume.pdf`}"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Send the buffer
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { savedJobs: jobId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Job saved successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { savedJobs: jobId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Job removed from saved',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedJobs');
    res.status(200).json({
      success: true,
      savedJobs: user.savedJobs,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;

    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password -refreshToken');

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
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

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
