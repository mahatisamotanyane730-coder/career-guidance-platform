const request = require('supertest');
const app = require('../../../server');

describe('Company Routes Integration', () => {
  let companyToken;

  beforeAll(async () => {
    // Login as company to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'company@test.ls',
        password: 'company123'
      });

    companyToken = loginResponse.body.token;
  });

  describe('GET /api/company/dashboard', () => {
    it('should return company dashboard with valid token', async () => {
      const response = await request(app)
        .get('/api/company/dashboard')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('company');
      expect(response.body.data).toHaveProperty('jobs');
      expect(response.body.data).toHaveProperty('stats');
    });

    it('should reject access with student token', async () => {
      // Get student token
      const studentLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@test.ls',
          password: 'student123'
        });

      const studentToken = studentLogin.body.token;

      const response = await request(app)
        .get('/api/company/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Access denied');
    });
  });

  describe('POST /api/company/jobs', () => {
    it('should create job posting', async () => {
      const jobData = {
        title: 'Senior Developer',
        description: 'Develop amazing applications',
        requirements: {
          degree: 'Computer Science',
          skills: ['JavaScript', 'Node.js', 'React'],
          experience: '5+ years'
        },
        salary: 35000,
        location: 'Maseru',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/company/jobs')
        .set('Authorization', `Bearer ${companyToken}`)
        .send(jobData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('posted successfully');
      expect(response.body.data.title).toBe('Senior Developer');
    });
  });
});