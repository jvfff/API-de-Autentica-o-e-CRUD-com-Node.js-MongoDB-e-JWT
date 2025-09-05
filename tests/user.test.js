const request = require('supertest');
const app = require('../server');
const { createTestUser, generateTestTokens } = require('./setup');

describe('User Routes', () => {
  let testUser, accessToken, refreshToken;

  beforeEach(async () => {
    testUser = await createTestUser({
      name: 'John Doe',
      email: 'john@example.com'
    });
    
    const tokens = generateTestTokens(testUser._id);
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    
    testUser.refreshTokens.push({ token: refreshToken });
    await testUser.save();
  });

  describe('GET /me', () => {
    test('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user._id).toBe(testUser._id.toString());
      
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('refreshTokens');
    });

    test('should not get profile without authentication', async () => {
      const response = await request(app)
        .get('/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Token de acesso requerido');
    });

    test('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Token inválido');
    });

    test('should not get profile with malformed auth header', async () => {
      const response = await request(app)
        .get('/me')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Token de acesso requerido');
    });

    test('should handle expired token', async () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: testUser._id }, 
        process.env.ACCESS_TOKEN_SECRET || 'test-access-secret',
        { expiresIn: '-1s' }
      );

      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Token expirado');
      expect(response.body.code).toBe('TOKEN_EXPIRED');
    });
  });
});