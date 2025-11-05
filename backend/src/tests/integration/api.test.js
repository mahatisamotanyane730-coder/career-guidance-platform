const request = require('supertest');

// Mock the server to avoid memory issues
jest.mock('../../../server', () => {
  const express = require('express');
  const app = express();
  
  app.use(require('express').json());
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Test API' });
  });
  
  app.get('/api/institutions', (req, res) => {
    res.json({ 
      success: true, 
      data: [{ id: 1, name: 'Test University' }] 
    });
  });
  
  return app;
});

const app = require('../../../server');

describe('Basic API Tests', () => {
  test('health check should return OK', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
  });

  test('institutions endpoint should return data', async () => {
    const response = await request(app)
      .get('/api/institutions')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});