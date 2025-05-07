const axios = require('axios');
const { summarizeNote } = require('../services/azureOpenAIService');

jest.mock('axios');

describe('summarizeNote', () => {
  const noteContent =
    'This is a test note to show a note being summarized and returned by Azure GPT...';

  it('should return a summary from Azure OpenAI', async () => {
    axios.post.mockResolvedValue({
      data: {
        choices: [{ text: ' Summary of the note.' }],
      },
    });

    const summary = await summarizeNote(noteContent);
    expect(summary).toBe('Summary of the note.');
    expect(axios.post).toHaveBeenCalled();
  });

  it('should throw an error if the request fails', async () => {
    const mockError = new Error('Request failed');
    mockError.response = { data: { error: 'Bad request' } };

    axios.post.mockRejectedValue(mockError);

    // Suppress console.error due to summarizeNote function logging error when request fails
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(summarizeNote(noteContent)).rejects.toThrow('Request failed');

    consoleSpy.mockRestore(); // Console is restored after test
  });
});
