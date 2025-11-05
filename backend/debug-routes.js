console.log('🔧 Testing individual route files...');

const routeFiles = [
  './src/routes/authRoutes',
  './src/routes/adminRoutes', 
  './src/routes/institutionRoutes',
  './src/routes/studentRoutes',
  './src/routes/companyRoutes',
  './src/routes/applicationRoutes',
  './src/routes/jobRoutes',
  './src/routes/uploadRoutes'
];

routeFiles.forEach((filePath, index) => {
  try {
    console.log(`🔧 Testing ${filePath}...`);
    const route = require(filePath);
    console.log(`✅ ${filePath} loaded successfully`);
  } catch (error) {
    console.error(`❌ ERROR in ${filePath}:`, error.message);
  }
});