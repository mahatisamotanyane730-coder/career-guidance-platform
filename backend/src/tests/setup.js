// Simple setup without memory-intensive operations
console.log('🧪 Setting up test environment...');

// Global test timeout
jest.setTimeout(10000);

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Simple test data
global.testUsers = {
  student: {
    id: 'student123',
    email: 'student@test.ls',
    name: 'Test Student',
    role: 'student',
    status: 'active'
  }
};

// Clean up
afterEach(() => {
  jest.clearAllMocks();
});