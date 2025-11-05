// Environment configuration and validation
const environment = {
  // Current environment
  current: process.env.NODE_ENV || 'development',

  // Check if development
  isDevelopment: process.env.NODE_ENV === 'development',

  // Check if production
  isProduction: process.env.NODE_ENV === 'production',

  // Check if testing
  isTest: process.env.NODE_ENV === 'test',

  // Required environment variables
  required: [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET'
  ],

  // Optional environment variables with defaults
  optional: {
    PORT: 5000,
    NODE_ENV: 'development',
    LOG_LEVEL: 'info',
    CORS_ORIGIN: 'http://localhost:3000'
  },

  // Validate environment
  validate: () => {
    const missing = environment.required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:', missing.join(', '));
      process.exit(1);
    }

    // Set defaults for optional variables
    Object.entries(environment.optional).forEach(([key, defaultValue]) => {
      if (!process.env[key]) {
        process.env[key] = defaultValue.toString();
      }
    });

    console.log(`✅ Environment loaded: ${environment.current}`);
  },

  // Get configuration for current environment
  getConfig: () => {
    return {
      environment: environment.current,
      port: process.env.PORT,
      corsOrigin: process.env.CORS_ORIGIN,
      logLevel: process.env.LOG_LEVEL,
      // Add other config values as needed
    };
  }
};

// Validate on import
environment.validate();

module.exports = environment;