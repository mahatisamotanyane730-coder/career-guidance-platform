const { getDashboard, applyForCourse } = require('../../../controllers/studentController');

describe('Student Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      user: global.testUsers.student,
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getDashboard', () => {
    it('should return student dashboard data', async () => {
      await getDashboard(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: global.testUsers.student,
            applications: expect.any(Array),
            recommendedJobs: expect.any(Array),
            stats: expect.objectContaining({
              totalApplications: expect.any(Number),
              pending: expect.any(Number),
              admitted: expect.any(Number)
            })
          })
        })
      );
    });

    it('should return applications for the specific student', async () => {
      await getDashboard(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      const applications = response.data.applications;
      
      // All applications should belong to the student
      applications.forEach(app => {
        expect(app.studentId).toBe(global.testUsers.student.id);
      });
    });

    it('should handle student with no applications', async () => {
      // This test ensures the function works for new students
      await getDashboard(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(Array.isArray(response.data.applications)).toBe(true);
    });
  });

  describe('applyForCourse', () => {
    it('should successfully apply for a course', async () => {
      mockReq.body = {
        courseId: 'course1',
        institutionId: 'inst1',
        documents: []
      };

      await applyForCourse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Application submitted successfully',
          data: expect.objectContaining({
            studentId: global.testUsers.student.id,
            courseId: 'course1',
            status: 'pending'
          })
        })
      );
    });

    it('should reject duplicate applications', async () => {
      mockReq.body = {
        courseId: 'course1', // Already applied in previous test
        institutionId: 'inst1',
        documents: []
      };

      await applyForCourse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Already applied for this course'
        })
      );
    });

    it('should create application with documents', async () => {
      mockReq.body = {
        courseId: 'course2',
        institutionId: 'inst1',
        documents: [
          { type: 'transcript', url: 'http://example.com/transcript.pdf' },
          { type: 'id_copy', url: 'http://example.com/id.jpg' }
        ]
      };

      await applyForCourse(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.data.documents).toHaveLength(2);
      expect(response.data.documents[0]).toHaveProperty('type');
      expect(response.data.documents[0]).toHaveProperty('url');
    });

    it('should set correct application timestamp', async () => {
      mockReq.body = {
        courseId: 'course3',
        institutionId: 'inst1',
        documents: []
      };

      const beforeApply = new Date();
      await applyForCourse(mockReq, mockRes);
      const afterApply = new Date();

      const response = mockRes.json.mock.calls[0][0];
      const appliedAt = new Date(response.data.appliedAt);
      
      expect(appliedAt >= beforeApply && appliedAt <= afterApply).toBe(true);
    });
  });
});