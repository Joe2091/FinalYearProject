// summarize integration tests
jest.mock('../services/azureOpenAIService', () => ({
  summarizeNote: jest.fn(),
}));

const request = require('supertest');
const app = require('../app');
const { summarizeNote } = require('../services/azureOpenAIService');

// Mock auth middleware
jest.mock('../middleware/verifyToken', () => (req, res, next) => {
  req.user = { uid: 'test-user' };
  next();
});

describe('POST /api/summarize', () => {
  it('should return a summary when content is provided', async () => {
    summarizeNote.mockResolvedValue('This is a summary.');

    const res = await request(app)
      .post('/api/summarize')
      .send({ content: 'Example note' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ summary: 'This is a summary.' });
    expect(summarizeNote).toHaveBeenCalledWith('Example note');
  });

  it('should return 500 if summarizeNote throws', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    summarizeNote.mockRejectedValue(new Error('Azure error'));

    const res = await request(app)
      .post('/api/summarize')
      .send({ content: 'This will fail' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to summarize note' });

    consoleSpy.mockRestore();
  });
});
