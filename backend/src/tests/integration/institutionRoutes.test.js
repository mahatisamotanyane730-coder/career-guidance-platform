const request = require('supertest');
const app = require('../../../server');

describe('Institution Routes Integration', () => {
  describe('GET /api/institutions', () => {
    it('should return all institutions', async () => {
      const response = await request(app)
        .get('/api/institutions')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return institutions with correct structure', async () => {
      const response = await request(app)
        .get('/api/institutions')
        .expect(200);

      const institution = response.body.data[0];
      expect(institution).toHaveProperty('id');
      expect(institution).toHaveProperty('name');
      expect(institution).toHaveProperty('email');
      expect(institution).toHaveProperty('status');
    });
  });

  describe('GET /api/institutions/:id', () => {
    it('should return a specific institution', async () => {
      const response = await request(app)
        .get('/api/institutions/1') // NUL institution
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.name).toBe('National University of Lesotho');
    });

    it('should return 404 for non-existent institution', async () => {
      const response = await request(app)
        .get('/api/institutions/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/institutions/courses/all', () => {
    it('should return all courses', async () => {
      const response = await request(app)
        .get('/api/institutions/courses/all')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return courses with institution and faculty info', async () => {
      const response = await request(app)
        .get('/api/institutions/courses/all')
        .expect(200);

      const course = response.body.data[0];
      expect(course).toHaveProperty('institutionName');
      expect(course).toHaveProperty('facultyName');
      expect(course).toHaveProperty('name');
      expect(course).toHaveProperty('duration');
    });
  });
});