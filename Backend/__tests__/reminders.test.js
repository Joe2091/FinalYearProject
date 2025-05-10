// Reminder Integration tests
jest.setTimeout(30000);
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Reminder = require('../models/Reminder');

// Mock auth middleware
jest.mock('../middleware/verifyToken', () => (req, res, next) => {
  req.user = { uid: 'test-user' };
  next();
});

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await Reminder.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Reminder Routes', () => {
  it('should create a reminder', async () => {
    const res = await request(app).post('/api/reminders').send({
      title: 'Test Reminder',
      datetime: new Date().toISOString(),
      content: 'Example content',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Reminder');
    expect(res.body.createdBy).toBe('test-user');
  });

  it('should reject creation with missing title', async () => {
    const res = await request(app).post('/api/reminders').send({
      datetime: new Date().toISOString(),
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Title must be a non-empty string/i);
  });

  it('should reject creation with invalid datetime', async () => {
    const res = await request(app).post('/api/reminders').send({
      title: 'Bad Reminder',
      datetime: 'date-not-valid',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid datetime/i);
  });

  it('should get all reminders for user', async () => {
    await Reminder.create({
      title: 'Reminder 1',
      datetime: new Date(),
      content: '...',
      createdBy: 'test-user',
    });

    const res = await request(app).get('/api/reminders');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('should update a reminder', async () => {
    const reminder = await Reminder.create({
      title: 'Old Title',
      datetime: new Date(),
      content: 'old content',
      createdBy: 'test-user',
    });

    const res = await request(app)
      .put(`/api/reminders/${reminder._id}`)
      .send({ title: 'Updated Title' });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  it('should return 400 for update with invalid ID', async () => {
    const res = await request(app)
      .put('/api/reminders/notanid')
      .send({ title: 'Won’t work' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid reminder ID/i);
  });

  it('should delete a reminder', async () => {
    const reminder = await Reminder.create({
      title: 'This will be deleted',
      datetime: new Date(),
      content: '',
      createdBy: 'test-user',
    });

    const res = await request(app).delete(`/api/reminders/${reminder._id}`);
    expect(res.statusCode).toBe(204);
  });

  it('should return 404 for delete with non-existing reminder', async () => {
    const id = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/reminders/${id}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});
