const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

const createTestUser = async (userData = {}) => {
  const User = require('../models/User');
  
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };
  
  const user = new User({ ...defaultUser, ...userData });
  await user.save();
  return user;
};

const generateTestTokens = (userId) => {
  const jwt = require('jsonwebtoken');
  
  const accessToken = jwt.sign(
    { userId }, 
    process.env.ACCESS_TOKEN_SECRET || 'test-access-secret',
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId }, 
    process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

module.exports = {
  createTestUser,
  generateTestTokens
};