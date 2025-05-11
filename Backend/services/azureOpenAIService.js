const axios = require('axios');
require('dotenv').config();

// summarize note function using Azure OpenAI API
async function summarizeNote(noteContent) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

  //API request URL
  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/completions?api-version=${apiVersion}`;

  //request headers set including API key
  const headers = {
    'Content-Type': 'application/json',
    'api-key': apiKey,
  };

  //Request body sent to AI to generate summary
  const data = {
    prompt: `Summarize the following note:\n\n${noteContent}`,
    max_tokens: 100,
    temperature: 0.7,
  };

  try {
    //POST request to Azure OpenAI
    const response = await axios.post(url, data, { headers });

    //Summary text requested form response
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
