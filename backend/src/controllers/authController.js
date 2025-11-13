const { firestoreHelper } = require('../config/firebase');
const { generateToken, isValidEmail, generateId } = require('../utils/helpers');
const { emailService } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, name, role, institutionName, companyName, phone, location } = req.body;

    console.log('🔐 Registration attempt:', { email, role, name });

    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password, name, role'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate role
    const validRoles = ['student', 'institution', 'company', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be: student, institution, company, or admin'
      });
    }

    // Check if user already exists - PROPERLY CHECK IN FIRESTORE
    console.log('🔍 Checking if user exists in Firestore...');
    const existingUser = await firestoreHelper.getUserByEmail(email);
    
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists. Please use a different email or login.'
      });
    }

    console.log('✅ User does not exist, creating new user...');

    // Generate verification token
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user data
    const userData = {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      role,
      status: 'active',
      isVerified: false,
      verificationToken,
      verificationTokenExpiry: verificationTokenExpiry.toISOString(),
      profileCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        phone: phone || '',
        address: {
          street: '',
          city: location || '',
          country: 'Lesotho'
        },
        bio: '',
        avatar: ''
      }
    };

    // Add role-specific fields
    if (role === 'institution' && institutionName) {
      userData.institutionName = institutionName;
    }

    if (role === 'company' && companyName) {
      userData.companyName = companyName;
    }

    // Create user in Firestore
    console.log('💾 Saving user to Firestore...');
    const newUser = await firestoreHelper.createUser(userData);
    console.log('✅ User created in Firestore with ID:', newUser.id);

    // Send verification email
    console.log('📧 Sending verification email...');
    const emailResult = await emailService.sendVerificationEmail(
      { email: userData.email, name: userData.name }, 
      verificationToken
    );

    // Return success WITHOUT auto-login
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification link.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isVerified: false
      },
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email in Firestore
    const user = await firestoreHelper.getUserByEmail(email.toLowerCase().trim());
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in.',
        needsVerification: true,
        email: user.email
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Your account is suspended. Please contact support.'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    console.log('✅ Login successful for:', email);

    // Remove password from response
    const { password: _, verificationToken, verificationTokenExpiry, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await firestoreHelper.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, verificationToken, verificationTokenExpiry, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user data'
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    console.log('🔍 Verifying email with token:', token);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Find user by verification token
    const users = await firestoreHelper.getAllUsers();
    const user = users.find(u => u.verificationToken === token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Check if token is expired
    if (new Date(user.verificationTokenExpiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired'
      });
    }

    // Update user as verified
    await firestoreHelper.updateUser(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
      status: 'active',
      updatedAt: new Date().toISOString()
    });

    // Send welcome email
    await emailService.sendWelcomeEmail({
      email: user.email,
      name: user.name
    });

    console.log('✅ Email verified successfully for:', user.email);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.'
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message
    });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log('🔍 Resending verification email to:', email);

    // Find user by email
    const user = await firestoreHelper.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const newVerificationToken = uuidv4();
    const newVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user with new token
    await firestoreHelper.updateUser(user.id, {
      verificationToken: newVerificationToken,
      verificationTokenExpiry: newVerificationTokenExpiry.toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Send new verification email
    const emailResult = await emailService.sendVerificationEmail(
      { email: user.email, name: user.name },
      newVerificationToken
    );

    res.json({
      success: true,
      message: 'Verification email sent successfully',
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending verification email',
      error: error.message
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await firestoreHelper.getUserByEmail(email);
    
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await firestoreHelper.updateUser(user.id, {
      resetToken,
      resetTokenExpiry: resetTokenExpiry.toISOString()
    });

    // Send password reset email
    await emailService.sendPasswordResetEmail(
      { email: user.email, name: user.name },
      resetToken
    );

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing request'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Find user by reset token
    const users = await firestoreHelper.getAllUsers();
    const user = users.find(u => u.resetToken === token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Check if token is expired
    if (new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await firestoreHelper.updateUser(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
};