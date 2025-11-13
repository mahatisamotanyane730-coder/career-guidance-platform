const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const emailService = {
  async sendEmail(to, subject, text, html = null) {
    try {
      console.log('📧 Attempting to send email to:', to);
      
      const transporter = createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Career Guidance Platform" <noreply@careerguide.ls>',
        to: to,
        subject: subject,
        text: text,
        html: html || text
      };

      console.log('📤 Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully! Message ID:', result.messageId);
      console.log('✅ Response:', result.response);
      
      return {
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
        response: result.response
      };
    } catch (error) {
      console.error('❌ Email sending failed!');
      console.error('❌ Error details:', error);
      
      return {
        success: false,
        message: 'Failed to send email',
        error: error.message,
        fullError: error
      };
    }
  },

  async sendVerificationEmail(user, verificationToken) {
    const verificationLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const subject = 'Verify Your Email Address - Career Guidance Platform';
    const text = `Hello ${user.name},\n\nPlease verify your email address by clicking this link: ${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">Verify Your Email Address</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Thank you for registering with the Career Guidance Platform. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #2563eb; background: #f3f4f6; padding: 10px; border-radius: 5px;">${verificationLink}</p>
        <p><strong>This link will expire in 24 hours.</strong></p>
        <p>If you didn't create an account, please ignore this email.</p>
        <br>
        <p>Best regards,<br><strong>Career Guidance Platform Team</strong></p>
      </div>
    `;

    console.log('🔐 Verification token generated:', verificationToken);
    console.log('🔗 Verification link:', verificationLink);

    return this.sendEmail(user.email, subject, text, html);
  },

  async sendWelcomeEmail(user) {
    const subject = 'Welcome to Career Guidance Platform!';
    const text = `Hello ${user.name}, welcome to our platform! Your account has been verified and is now active.`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #10b981; text-align: center;">Welcome to Career Guidance Platform!</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Your email has been successfully verified and your account is now active.</p>
        <p>You can now log in to your account and start using all the features available to you.</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" 
             style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Your Account
          </a>
        </div>
        <br>
        <p>Best regards,<br><strong>Career Guidance Platform Team</strong></p>
      </div>
    `;

    return this.sendEmail(user.email, subject, text, html);
  }
};

module.exports = { emailService };