const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/User');
const Note = require('../models/Note');

router.post('/share/:noteId', verifyToken, async (req, res) => {
  const { email } = req.body;
  const { noteId } = req.params;

  try {
    const recipientUser = await User.findOne({ email });
    if (!recipientUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // only the note owner can share
    if (note.createdBy !== req.user.uid) {
      return res
        .status(403)
        .json({ message: 'Not authorized to share this note' });
    }

    const recipientUid = recipientUser.uid;

    // No Duplicate Shares
    if (!note.sharedWith.includes(recipientUid)) {
      note.sharedWith.push(recipientUid);
      await note.save();
    }

    res.status(200).json({ message: 'Note shared successfully' });
  } catch (err) {
    console.error('Error sharing note:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
