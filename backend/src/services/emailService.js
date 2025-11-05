// Mock email service for development
const emailService = {
  async sendEmail(to, subject, text, html = null) {
    console.log('📧 Mock Email Service:');
    console.log('   To:', to);
    console.log('   Subject:', subject);
    console.log('   Body:', text);
    
    // In a real application, you would integrate with an email service like:
    // - SendGrid
    // - Nodemailer with Gmail/SMTP
    // - AWS SES
    
    return Promise.resolve({
      success: true,
      message: 'Email sent successfully (mock service)',
      messageId: `mock-email-${Date.now()}`
    });
  },

  async sendWelcomeEmail(user) {
    const subject = 'Welcome to Career Guidance Platform';
    const text = `Hello ${user.name}, welcome to our platform! Your account has been created successfully.`;
    
    return this.sendEmail(user.email, subject, text);
  },

  async sendVerificationEmail(user, verificationToken) {
    const subject = 'Verify Your Email Address';
    const text = `Hello ${user.name}, please verify your email using this token: ${verificationToken}`;
    
    return this.sendEmail(user.email, subject, text);
  },

  async sendApprovalNotification(user) {
    const subject = 'Account Approval Notification';
    const text = `Hello ${user.name}, your ${user.role} account has been approved. You can now access all features.`;
    
    return this.sendEmail(user.email, subject, text);
  }
};

module.exports = {
  emailService
};