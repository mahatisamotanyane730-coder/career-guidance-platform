const { login, register, getMe } = require('../../../controllers/authController');
const { logger } = require('../../../middleware/errorHandler');

// Mock the logger to prevent console output during tests
jest.mock('../../../middleware/errorHandler', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('Auth Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      mockReq.body = {
        email: 'student@test.ls',
        password: 'student123'
      };

      await login(mockReq, mockRes);

      expect(mockRes.status).not.toHaveBeenCalledWith(400);
      expect(mockRes.status).not.toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
          token: expect.any(String),
          user: expect.objectContaining({
            email: 'student@test.ls',
            role: 'student'
          })
        })
      );
    });

    it('should reject login with invalid credentials', async () => {
      mockReq.body = {
        email: 'wrong@test.ls',
        password: 'wrongpassword'
      };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid credentials'
        })
      );
    });

    it('should reject login with missing fields', async () => {
      mockReq.body = {
        email: 'test@test.ls'
        // password missing
      };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Email and password are required'
        })
      );
    });
  });

  describe('register', () => {
    it('should register a new student successfully', async () => {
      mockReq.body = {
        email: 'newstudent@test.ls',
        password: 'newpassword123',
        name: 'New Student',
        role: 'student'
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Registration successful',
          user: expect.objectContaining({
            email: 'newstudent@test.ls',
            name: 'New Student',
            role: 'student'
          })
        })
      );
    });

    it('should register a new institution with institution name', async () => {
      mockReq.body = {
        email: 'newinstitution@test.ls',
        password: 'newpassword123',
        name: 'New University',
        role: 'institution',
        institutionName: 'New University Lesotho'
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          user: expect.objectContaining({
            role: 'institution',
            institutionName: 'New University Lesotho'
          })
        })
      );
    });

    it('should reject registration with existing email', async () => {
      mockReq.body = {
        email: 'student@test.ls', // Already exists
        password: 'password123',
        name: 'Duplicate Student',
        role: 'student'
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User already exists with this email'
        })
      );
    });

    it('should reject registration with missing required fields', async () => {
      mockReq.body = {
        email: 'test@test.ls',
        password: 'password123'
        // name and role missing
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'All fields are required'
        })
      );
    });
  });

  describe('getMe', () => {
    it('should return current user data', async () => {
      mockReq.user = global.testUsers.student;

      await getMe(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          user: global.testUsers.student
        })
      );
    });

    it('should handle errors when getting user data', async () => {
      // Simulate an error by not setting req.user
      mockReq.user = undefined;

      await getMe(mockReq, mockRes);

      // The controller should handle this gracefully
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
});