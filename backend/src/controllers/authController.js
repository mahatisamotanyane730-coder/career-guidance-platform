const { firestoreHelper } = require('../config/firebase');
const { generateToken, isValidEmail } = require('../utils/helpers');

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

    // Create user data
    const userData = {
      email: email.toLowerCase().trim(),
      password, // In production, hash this password
      name: name.trim(),
      role,
      status: 'active',
      verificationStatus: role === 'student' ? 'verified' : 'pending',
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

    // Return success WITHOUT auto-login
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please login with your credentials.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
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
    if (user.password !== password) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
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
    const { password: _, ...userWithoutPassword } = user;

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
    const { password: _, ...userWithoutPassword } = user;

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

module.exports = {
  register,
  login,
  getMe
};