// chat Integration Tests
jest.mock('axios');
const request = require('supertest');
const app = require('../app');
const axios = require('axios');

// Mock auth middleware
jest.mock('../middleware/verifyToken', () => (req, res, next) => {
  req.user = { uid: 'test-user' };
  next();
});

describe('POST /api/chat', () => {
  it('should return a reply from the chatbot', async () => {
    axios.post.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              role: 'assistant',
              content: '**Hello!** This is a test reply.',
            },
          },
        ],
      },
    });

    const res = await request(app)
      .post('/api/chat')
      .send({
        messages: [{ role: 'user', content: 'Tell me a joke.' }],
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      role: 'assistant',
      content: '**Hello!** This is a test reply.',
    });
  });

  it('should return 500 if Azure call fails', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {}); // logs suppressed
    axios.post.mockRejectedValue(new Error('Azure API failure'));

    const res = await request(app)
      .post('/api/chat')
      .send({
        messages: [{ role: 'user', content: 'Test error' }],
      });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Chat failed' });
    consoleSpy.mockRestore(); // Restored after test
  });

  it('should return 400 if messages are missing', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {}); // logs suppressed

    const res = await request(app).post('/api/chat').send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Missing or invalid messages' });

    consoleSpy.mockRestore(); //Restored after test
  });
});
