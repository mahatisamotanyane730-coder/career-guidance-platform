const request = require('supertest');
const app = require('../../../server');

describe('Student Routes Integration', () => {
  let studentToken;

  beforeAll(async () => {
    // Login as student to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@test.ls',
        password: 'student123'
      });

    studentToken = loginResponse.body.token;
  });

  describe('GET /api/students/dashboard', () => {
    it('should return student dashboard with valid token', async () => {
      const response = await request(app)
        .get('/api/students/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('applications');
      expect(response.body.data).toHaveProperty('recommendedJobs');
      expect(response.body.data).toHaveProperty('stats');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/students/dashboard')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/students/dashboard')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/students/applications', () => {
    it('should submit course application', async () => {
      const response = await request(app)
        .post('/api/students/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: 'course1',
          institutionId: 'inst1',
          documents: []
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('submitted successfully');
      expect(response.body.data).toHaveProperty('studentId');
      expect(response.body.data).toHaveProperty('courseId', 'course1');
    });

    it('should reject application with missing fields', async () => {
      const response = await request(app)
        .post('/api/students/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: 'course1'
          // institutionId missing
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});