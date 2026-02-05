import nodemailer from 'nodemailer';

export const sendEmail = async (email, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Job Listing Portal!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for registering with us. We're excited to have you on board!</p>
      <p>Start exploring opportunities or post your jobs today.</p>
      <p>Best regards,<br>Job Listing Team</p>
    </div>
  `;
  return sendEmail(email, 'Welcome to Job Listing Portal', html);
};

export const sendApplicationNotification = async (email, jobTitle, applicantName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Application</h2>
      <p>You have a new application for the position: <strong>${jobTitle}</strong></p>
      <p>Applicant: <strong>${applicantName}</strong></p>
      <p>Log in to your dashboard to review the application.</p>
      <p>Best regards,<br>Job Listing Team</p>
    </div>
  `;
  return sendEmail(email, `New Application for ${jobTitle}`, html);
};

export const sendStatusUpdateEmail = async (email, jobTitle, status) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Application Status Update</h2>
      <p>Your application status has been updated!</p>
      <p>Job: <strong>${jobTitle}</strong></p>
      <p>New Status: <strong>${status}</strong></p>
      <p>Log in to your dashboard for more details.</p>
      <p>Best regards,<br>Job Listing Team</p>
    </div>
  `;
  return sendEmail(email, `Application Status: ${status}`, html);
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>Job Listing Team</p>
    </div>
  `;
  return sendEmail(email, 'Password Reset Request', html);
};
