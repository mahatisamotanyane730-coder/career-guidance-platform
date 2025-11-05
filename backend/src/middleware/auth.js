const { verifyToken } = require('../utils/helpers');
const { firestoreHelper } = require('../config/firebase');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    console.log('🔐 Verifying token...');
    
    try {
      // Verify JWT token
      const decoded = verifyToken(token);
      
      // Get user from database
      const user = await firestoreHelper.getUserById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. User not found.'
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Account is suspended. Please contact support.'
        });
      }

      // Add user to request
      req.user = user;
      console.log('✅ User authenticated:', user.email, 'Role:', user.role);
      
      next();
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError.message);
      
      // Development fallback: Try to use token as user ID
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Trying development fallback authentication...');
        
        const user = await firestoreHelper.getUserById(token);
        if (user && user.status === 'active') {
          req.user = user;
          console.log('✅ Development fallback authentication successful for:', user.email);
          return next();
        }
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        error: jwtError.message
      });
    }
    
  } catch (error) {
    console.error('❌ Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed.',
      error: error.message
    });
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No user information.'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`❌ Authorization failed: User role ${req.user.role} not in required roles:`, roles);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    console.log(`✅ User authorized with role: ${req.user.role}`);
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};