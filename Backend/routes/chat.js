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

  try {
    const response = await axios.post(
      `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        messages,
        max_tokens: 500,
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
