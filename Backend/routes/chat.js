const express = require('express');
const router = express.Router();
const axios = require('axios');
const verifyToken = require('../middleware/verifyToken');

const endpoint = process.env.AZURE_OPENAI_CHATBOT_ENDPOINT;
const deployment = process.env.AZURE_OPENAI_CHATBOT_DEPLOYMENT_NAME;
const apiVersion = process.env.AZURE_OPENAI_CHATBOT_API_VERSION;
const apiKey = process.env.AZURE_OPENAI_CHATBOT_API_KEY;

router.post('/', verifyToken, async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages' });
  }

  const systemPrompt = {
    role: 'system',
    content: `
  You are a helpful assistant that formats replies with clear Markdown.

- Use **lists** (numbered or bullets) when the user asks for steps, points, or explanations.
- Use **paragraphs** for storytelling, summaries, or descriptive responses.
- Emphasize key terms using **bold** or _italic_.
- Always use line breaks between paragraphs or list items for readability.

If the user asks for a story or narrative, respond in flowing paragraphs instead of lists.
  `,
  };

  const updatedMessages = [systemPrompt, ...messages];

  try {
    const response = await axios.post(
      `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        messages: updatedMessages,
        max_tokens: 750,
        temperature: 0.7,
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    const reply = response.data.choices[0].message;
    res.json(reply);
  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Chat failed' });
  }
});

module.exports = router;
