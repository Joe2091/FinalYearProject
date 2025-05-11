// userChats Integration tests
jest.setTimeout(30000);
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const UserChats = require('../models/UserChats');

// Mock auth middleware
jest.mock('../middleware/verifyToken', () => (req, res, next) => {
  req.user = { uid: 'test-user' };
  next();
});

let mongoServer;

//setup in-memory MongoDB
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await UserChats.deleteMany(); //After each test chat collection is cleared
});

//Close Db and server after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('UserChats API', () => {
  test('saveChats should save user chats', async () => {
    const res = await request(app)
      .post('/api/saveChats')
      .set('Authorization', 'Bearer test-token')
      .send({ chats: ['Test Input', 'Test chat'] });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Chats saved successfully');
  });

  test('getChats should retrieve saved chats', async () => {
    await request(app)
      .post('/api/saveChats')
      .set('Authorization', 'Bearer test-token')
      .send({ chats: ['Test Input', 'Test chat'] });

    const res = await request(app)
      .get('/api/getChats')
      .set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(['Test Input', 'Test chat']);
  });

  test('saveChats should fail when chats are missing', async () => {
    const res = await request(app)
      .post('/api/saveChats')
      .set('Authorization', 'Bearer test-token')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Missing chats');
  });

  test('getChats should return empty array for no chats', async () => {
    const res = await request(app)
      .get('/api/getChats')
      .set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
