const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

console.log('🔧 1. Starting server initialization...');

const app = express();

console.log('🔧 2. Express app created...');

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

console.log('🔧 3. Middleware loaded...');


// BASIC ROUTES - TEST THESE FIRST
app.get('/', (req, res) => {
  console.log('✅ Root route hit!');
  res.json({ 
    message: 'Career Guidance Platform API', 
    version: '1.0.0',
    status: 'Running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      institutions: '/api/institutions',
      jobs: '/api/jobs'
    }
  });
});

app.get('/api/health', (req, res) => {
  console.log('✅ Health check route hit!');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Career Guidance API',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test', (req, res) => {
  console.log('✅ Test route hit!');
  res.json({ 
    message: 'Backend is working perfectly!',
    data: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register'
      },
      institutions: 'GET /api/institutions',
      jobs: 'GET /api/jobs'
    }
  });
});

// SIMPLE INSTITUTIONS ROUTE (fallback)
app.get('/api/institutions', (req, res) => {
  console.log('✅ Institutions route hit!');
  res.json({
    success: true,
    data: [
      {
        id: 'inst-001',
        name: 'National University of Lesotho',
        email: 'info@nul.ls',
        location: 'Roma, Lesotho',
        status: 'active'
      },
      {
        id: 'inst-002', 
        name: 'Limkokwing University',
        email: 'info@limkokwing.ls',
        location: 'Maseru, Lesotho',
        status: 'active'
      }
    ]
  });
});

// SIMPLE JOBS ROUTE (fallback)
app.get('/api/jobs', (req, res) => {
  console.log('✅ Jobs route hit!');
  res.json({
    success: true,
    data: [
      {
        id: 'job-001',
        title: 'Software Developer',
        company: 'Tech Solutions Ltd',
        location: 'Maseru, Lesotho',
        type: 'full-time',
        salary: 'M15,000 - M20,000',
        status: 'open'
      }
    ]
  });
});

console.log('🔧 4. Basic routes configured...');

// TRY TO LOAD ROUTES WITH ERROR HANDLING
try {
  console.log('🔧 5. Attempting to load routes...');
  const routes = require('./src/routes');
  app.use('/api', routes);
  console.log('✅ All routes loaded successfully!');
} catch (error) {
  console.error('❌ ERROR loading routes:', error.message);
  console.log('💡 Using basic routes only...');
  
  // Add basic auth route as fallback
  app.post('/api/auth/login', (req, res) => {
    console.log('✅ Basic login route hit!');
    const { email, password } = req.body;
    
    // Test credentials
    if (email === 'test@test.com' && password === 'test123') {
      return res.json({
        success: true,
        message: 'Login successful (basic route)',
        token: 'mock-token-student-123',
        user: {
          id: 'dev-user-001',
          email: 'test@test.com',
          name: 'Development Test User',
          role: 'student',
          status: 'active'
        }
      });
    }
    
    if (email === 'admin@careerguide.ls' && password === 'admin123') {
      return res.json({
        success: true,
        message: 'Login successful (basic route)',
        token: 'mock-token-admin-123',
        user: {
          id: 'admin-user-001',
          email: 'admin@careerguide.ls',
          name: 'System Administrator',
          role: 'admin',
          status: 'active'
        }
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Invalid credentials. Try: test@test.com / test123'
    });
  });

  // Basic register route
  app.post('/api/auth/register', (req, res) => {
    console.log('✅ Basic register route hit!');
    const { email, password, name, role } = req.body;
    
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    res.json({
      success: true,
      message: 'Registration successful (basic route)',
      token: 'mock-token-new-user',
      user: {
        id: `user-${Date.now()}`,
        email,
        name,
        role,
        status: 'active'
      }
    });
  });
}

console.log('🔧 6. Server configuration complete...');



const PORT = process.env.PORT || 5000;

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});
// START SERVER
const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 SERVER SUCCESSFULLY STARTED on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Firebase: ${process.env.FIREBASE_PROJECT_ID ? 'Connected ✅' : 'Mock DB 🔧'}`);
  console.log('='.repeat(60));
  console.log('🎯 TEST THESE ENDPOINTS:');
  console.log(`   http://localhost:${PORT}/`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log(`   http://localhost:${PORT}/api/test`);
  console.log(`   http://localhost:${PORT}/api/institutions`);
  console.log('='.repeat(60));
  console.log('🔐 TEST LOGIN CREDENTIALS:');
  console.log('   Student: test@test.com / test123');
  console.log('   Admin: admin@careerguide.ls / admin123');
  console.log('='.repeat(60));
});

console.log('🔧 7. Server listen called...');

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('🔧 8. Error handlers registered...');
console.log('🔧 9. Server initialization COMPLETE!');

module.exports = server;