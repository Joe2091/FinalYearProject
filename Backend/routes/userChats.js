const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const UserChats = require('../models/UserChats');

const router = express.Router();

// Save user's chats
router.post('/saveChats', verifyToken, async (req, res) => {
  const { chats } = req.body;
  const uid = req.user.uid;

  if (!chats) return res.status(400).json({ message: 'Missing chats' });

  try {
    await UserChats.updateOne({ uid }, { chats }, { upsert: true });
    res.status(200).json({ message: 'Chats saved successfully' });
  } catch (error) {
    console.error('Error saving chats:', error);
    res.status(500).json({ message: 'Error saving chats' });
  }
});

// Get user's chats
router.get('/getChats', verifyToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    const userChats = await UserChats.findOne({ uid });
    res.status(200).json(userChats ? userChats.chats : []);
  } catch (error) {
    console.error('Error retrieving chats:', error);
    res.status(500).json({ message: 'Error retrieving chats' });
  }
});

module.exports = router;
