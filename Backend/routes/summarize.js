const express = require('express');
const router = express.Router();
const { summarizeNote } = require('../services/azureOpenAIService');

router.post('/', async (req, res) => {
  const { content } = req.body;

  try {
    const summary = await summarizeNote(content);
    res.json({ summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to summarize note' });
  }
});

module.exports = router;
