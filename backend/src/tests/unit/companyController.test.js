const { getDashboard, createJob, getJobs } = require('../../../controllers/companyController');

describe('Company Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      user: global.testUsers.company,
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getDashboard', () => {
    it('should return company dashboard data', async () => {
      await getDashboard(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            company: expect.any(Object),
            jobs: expect.any(Array),
            stats: expect.objectContaining({
              totalJobs: expect.any(Number),
              activeJobs: expect.any(Number)
            })
          })
        })
      );
    });

    it('should return only company-specific jobs', async () => {
      await getDashboard(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      const jobs = response.data.jobs;
      
      jobs.forEach(job => {
        expect(job.companyId).toBe(global.testUsers.company.id);
      });
    });
  });

  describe('createJob', () => {
    it('should create a new job posting', async () => {
      mockReq.body = {
        title: 'Senior Software Engineer',
        description: 'Develop amazing software solutions',
        requirements: {
          degree: 'Computer Science',
          skills: ['JavaScript', 'React', 'Node.js'],
          experience: '5+ years'
        },
        salary: 35000,
        location: 'Maseru',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      await createJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Job posted successfully',
          data: expect.objectContaining({
            companyId: global.testUsers.company.id,
            title: 'Senior Software Engineer',
            status: 'active'
          })
        })
      );
    });

    it('should set correct job creation timestamp', async () => {
      mockReq.body = {
        title: 'Test Job',
        description: 'Test Description',
        requirements: {
          degree: 'Any',
          skills: ['Testing'],
          experience: '1 year'
        },
        salary: 10000,
        location: 'Test Location',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const beforeCreate = new Date();
      await createJob(mockReq, mockRes);
      const afterCreate = new Date();

      const response = mockRes.json.mock.calls[0][0];
      const createdAt = new Date(response.data.createdAt);
      
      expect(createdAt >= beforeCreate && createdAt <= afterCreate).toBe(true);
    });
  });

  describe('getJobs', () => {
    it('should return company jobs', async () => {
      await getJobs(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: expect.any(Number),
          data: expect.any(Array)
        })
      );
    });

    it('should return only jobs belonging to the company', async () => {
      await getJobs(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      const jobs = response.data;
      
      jobs.forEach(job => {
        expect(job.companyId).toBe(global.testUsers.company.id);
      });
    });
  });
});