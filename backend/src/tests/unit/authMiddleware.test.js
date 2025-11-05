const { authenticate, authorize } = require('../../../middleware/auth');

describe('Auth Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      header: jest.fn()
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  test('authenticate should allow public routes in development', async () => {
    mockReq.header.mockReturnValue(undefined);

    await authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  test('authorize should allow correct role', () => {
    mockReq.user = { role: 'student' };
    const middleware = authorize('student');
    
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  test('authorize should deny incorrect role', () => {
    mockReq.user = { role: 'student' };
    const middleware = authorize('admin');
    
    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
  });
});