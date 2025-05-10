// notes Integration Tests
jest.setTimeout(30000);
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Note = require('../models/Note');

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
  await Note.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Notes Routes', () => {
  it('should create a new note', async () => {
    const res = await request(app).post('/api/notes').send({
      title: 'My Note',
      content: 'Example Content',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('My Note');
    expect(res.body.createdBy).toBe('test-user');
  });

  it('should get all user notes (owned and shared)', async () => {
    await Note.create([
      { title: 'Note 1', content: 'Owned', createdBy: 'test-user' },
      {
        title: 'Note 2',
        content: 'Shared',
        createdBy: 'other-user',
        sharedWith: ['test-user'],
      },
    ]);

    const res = await request(app).get('/api/notes');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('should update owned note', async () => {
    const note = await Note.create({
      title: 'Old',
      content: 'Example Content',
      createdBy: 'test-user',
    });
    const res = await request(app)
      .put(`/api/notes/${note._id}`)
      .send({ title: 'Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated');
  });

  it('should not update a note not owned by user', async () => {
    const note = await Note.create({
      title: 'Note owned by test-user',
      content: 'Example Content',
      createdBy: 'other-user',
    });
    const res = await request(app)
      .put(`/api/notes/${note._id}`)
      .send({ title: 'Fail Update' });
    expect(res.statusCode).toBe(404);
  });

  it('should delete owned note', async () => {
    const note = await Note.create({
      title: 'Will be deleted',
      content: 'Example Content',
      createdBy: 'test-user',
    });
    const res = await request(app).delete(`/api/notes/${note._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('should remove shared user from sharedWith list', async () => {
    const note = await Note.create({
      title: 'Shared Note',
      content: 'Example Content',
      createdBy: 'other-user',
      sharedWith: ['test-user'],
    });

    const res = await request(app).delete(`/api/notes/${note._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Removed shared/i);
  });

  it('should toggle favorite status', async () => {
    const note = await Note.create({
      title: 'Favorite',
      content: 'Example Content',
      createdBy: 'test-user',
      favorites: [],
    });

    const res = await request(app).post(`/api/notes/${note._id}/favorite`);
    expect(res.statusCode).toBe(200);
    expect(res.body.isFavorite).toBe(true);

    const toggleBack = await request(app).post(
      `/api/notes/${note._id}/favorite`,
    );
    expect(toggleBack.body.isFavorite).toBe(false);
  });

  it('should return 404 for favorite toggle on nonexistent note', async () => {
    const id = new mongoose.Types.ObjectId();
    const res = await request(app).post(`/api/notes/${id}/favorite`);
    expect(res.statusCode).toBe(404);
  });
});
