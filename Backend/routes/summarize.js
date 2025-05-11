const express = require('express');
const router = express.Router();
const { summarizeNote } = require('../services/azureOpenAIService');

//Post used to summarize note content
router.post('/', async (req, res) => {
  const { content } = req.body;

  try {
    //Call Azure AI service to get note summary
    const summary = await summarizeNote(content);

    //Summary is sent back to user
    res.json({ summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to summarize note' });
  }
});

module.exports = router;
