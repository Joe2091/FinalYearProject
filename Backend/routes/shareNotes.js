module.exports = function (io) {
  const express = require('express');
  const router = express.Router();
  const verifyToken = require('../middleware/verifyToken');
  const User = require('../models/User');
  const Note = require('../models/Note');

  //route to share note using another user's email
  router.post('/share/:noteId', verifyToken, async (req, res) => {
    const { email } = req.body;
    const { noteId } = req.params;

    try {
      //find recipient by email
      const recipientUser = await User.findOne({ email });
      if (!recipientUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      //find note by id
      const note = await Note.findById(noteId);
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }

      // Only the note owner can share
      if (note.createdBy !== req.user.uid) {
        return res
          .status(403)
          .json({ message: 'Not authorized to share this note' });
      }

      const recipientUid = recipientUser.uid;

      let isNewShare = false;

      //only share if it hasn't already been shared with the user
      if (!note.sharedWith.includes(recipientUid)) {
        note.sharedWith.push(recipientUid);
        await note.save();
        isNewShare = true;
      }

      //note room and recipient notified using Socket.IO
      if (isNewShare) {
        io.to(note._id.toString()).emit('note-shared', note);

        io.to(recipientUid).emit('note-shared', note);
      }

      res.status(200).json({ message: 'Note shared successfully' });
    } catch (err) {
      console.error('Error sharing note:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  return router;
};
