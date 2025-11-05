const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

// Create transporter
const transporter = nodemailer.createTransporter(emailConfig);

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter configuration failed:', error);
  } else {
    console.log('✅ Email transporter is ready to send messages');
  }
});

// Email templates
const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to CareerGuide LS!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">Welcome to CareerGuide LS!</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering with CareerGuide LS. Your account has been successfully created and you can now:</p>
        <ul>
          <li>Browse educational institutions and courses</li>
          <li>Apply for your desired programs online</li>
          <li>Explore career opportunities after graduation</li>
          <li>Connect with potential employers</li>
        </ul>
        <p>We're excited to be part of your educational and career journey!</p>
        <br>
        <p>Best regards,<br><strong>The CareerGuide LS Team</strong></p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="text-align: center; color: #6b7280; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `
  }),

  applicationSubmitted: (name, courseName, institutionName) => ({
    subject: 'Application Submitted Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #10b981; text-align: center;">Application Submitted!</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your application for <strong>${courseName}</strong> at <strong>${institutionName}</strong> has been submitted successfully.</p>
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>The institution will review your application</li>
          <li>You'll receive updates on your application status</li>
          <li>Check your dashboard regularly for any additional requirements</li>
        </ul>
        <p>We wish you the best of luck with your application!</p>
        <br>
        <p>Best regards,<br><strong>The CareerGuide LS Team</strong></p>
      </div>
    `
  }),

  passwordReset: (name, resetLink) => ({
    subject: 'Password Reset Request - CareerGuide LS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #ef4444; text-align: center;">Password Reset</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>We received a request to reset your password for your CareerGuide LS account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br><strong>The CareerGuide LS Team</strong></p>
      </div>
    `
  })
};

module.exports = { transporter, emailTemplates };