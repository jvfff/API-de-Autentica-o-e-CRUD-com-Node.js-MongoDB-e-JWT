const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const { createTestUser } = require('./setup');

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should not register user with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Dados inválidos');
    });

    test('should not register user with weak password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Dados inválidos');
    });

    test('should not register user with existing email', async () => {
      await createTestUser({ email: 'existing@example.com' });

      const userData = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Email já está em uso');
    });
  });

  describe('POST /auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await createTestUser({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    test('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
    });

    test('should not login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Credenciais inválidas');
    });

    test('should not login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Credenciais inválidas');
    });
  });

  describe('POST /auth/refresh', () => {
    let testUser, refreshToken;

    beforeEach(async () => {
      testUser = await createTestUser();
      
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });
        
      refreshToken = loginResponse.body.refreshToken;
    });

    test('should refresh tokens successfully', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
    });

    test('should not refresh with invalid token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/logout', () => {
    let testUser, refreshToken;

    beforeEach(async () => {
      testUser = await createTestUser();
      
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });
        
      refreshToken = loginResponse.body.refreshToken;
    });

    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      
      const user = await User.findById(testUser._id);
      expect(user.refreshTokens).toHaveLength(0);
    });
  });
});