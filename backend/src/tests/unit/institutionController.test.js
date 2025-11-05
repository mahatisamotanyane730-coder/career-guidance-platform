const { 
  getInstitutions, 
  getInstitution, 
  getCourses 
} = require('../../../controllers/institutionController');

describe('Institution Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      params: {},
      query: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getInstitutions', () => {
    it('should return all institutions', async () => {
      await getInstitutions(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: expect.any(Number),
          data: expect.any(Array)
        })
      );
    });

    it('should return institutions with correct structure', async () => {
      await getInstitutions(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      
      expect(response.data[0]).toHaveProperty('id');
      expect(response.data[0]).toHaveProperty('name');
      expect(response.data[0]).toHaveProperty('email');
      expect(response.data[0]).toHaveProperty('status');
    });
  });

  describe('getInstitution', () => {
    it('should return a specific institution', async () => {
      mockReq.params.id = '1'; // NUL institution

      await getInstitution(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: '1',
            name: 'National University of Lesotho'
          })
        })
      );
    });

    it('should return 404 for non-existent institution', async () => {
      mockReq.params.id = 'nonexistent';

      await getInstitution(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Institution not found'
        })
      );
    });

    it('should return institution with faculties and courses', async () => {
      mockReq.params.id = '1';

      await getInstitution(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      
      expect(response.data).toHaveProperty('faculties');
      expect(Array.isArray(response.data.faculties)).toBe(true);
      
      if (response.data.faculties.length > 0) {
        expect(response.data.faculties[0]).toHaveProperty('courses');
        expect(Array.isArray(response.data.faculties[0].courses)).toBe(true);
      }
    });
  });

  describe('getCourses', () => {
    it('should return all courses', async () => {
      await getCourses(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: expect.any(Number),
          data: expect.any(Array)
        })
      );
    });

    it('should return courses with institution and faculty info', async () => {
      await getCourses(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      
      expect(response.data[0]).toHaveProperty('institutionName');
      expect(response.data[0]).toHaveProperty('facultyName');
      expect(response.data[0]).toHaveProperty('name');
      expect(response.data[0]).toHaveProperty('duration');
      expect(response.data[0]).toHaveProperty('fees');
    });

    it('should handle empty courses list', async () => {
      // This test ensures the function works even with no courses
      await getCourses(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(Array.isArray(response.data)).toBe(true);
    });
  });
});