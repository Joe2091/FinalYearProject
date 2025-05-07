const axios = require('axios');
require('dotenv').config();

async function summarizeNote(noteContent) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/completions?api-version=${apiVersion}`;

  const headers = {
    'Content-Type': 'application/json',
    'api-key': apiKey,
  };

  const data = {
    prompt: `Summarize the following note:\n\n${noteContent}`,
    max_tokens: 100,
    temperature: 0.7,
  };

  try {
    const response = await axios.post(url, data, { headers });
    const summary = response.data.choices[0].text.trim();
    return summary;
  } catch (error) {
    console.error(
      'Error summarizing note:',
      error.response?.data || error.message,
    );
    throw error;
  }
}

module.exports = { summarizeNote };
