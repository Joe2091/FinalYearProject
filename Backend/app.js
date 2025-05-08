const express = require('express');
const cors = require('cors');
const verifyToken = require('./middleware/verifyToken');
const Note = require('./models/Note');
const summarizeRoute = require('./routes/summarize');
const chatRoute = require('./routes/chat');
const userChatsRoutes = require('./routes/userChats');
const remindersRoute = require('./routes/reminders');
require('./services/reminderScheduler');

const app = express();

const allowedOrigins = [
  'chrome-extension://*',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://178.62.76.180:5000',
];

app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('chrome-extension://')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Note routes
//app.get('/', (req, res) => res.send('Notes API is running...'));

app.post('/api/notes', verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNote = new Note({ title, content, createdBy: req.user.uid });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Error creating note' });
  }
});

app.get('/api/notes', verifyToken, async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [{ createdBy: req.user.uid }, { sharedWith: req.user.uid }],
    });
    res.json(notes);
  } catch (error) {
    console.error('Error Fetching notes:', error);
    res.status(500).json({ error: 'Error fetching notes' });
  }
});

app.put('/api/notes/:id', verifyToken, async (req, res) => {
  try {
    const { title, content, isFavorite } = req.body;
    const updated = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ createdBy: req.user.uid }, { sharedWith: req.user.uid }],
      },
      { title, content, isFavorite },
      { new: true },
    );
    if (!updated)
      return res
        .status(404)
        .json({ message: 'Note not found or unauthorized' });
    res.json(updated);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Error updating note' });
  }
});

app.delete('/api/notes/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.createdBy === userId) {
      await Note.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Note deleted (owner)' });
    }
    if (note.sharedWith.includes(userId)) {
      note.sharedWith = note.sharedWith.filter((uid) => uid !== userId);
      await note.save();
      return res.json({ message: 'Removed shared note for user' });
    }
    res.status(403).json({ message: 'Not authorized to delete this note' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Error deleting note' });
  }
});

app.post('/api/notes/:id/favorite', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const index = note.favorites.indexOf(userId);
    const isFavorite =
      index > -1
        ? (note.favorites.splice(index, 1), false)
        : (note.favorites.push(userId), true);
    note.updatedAt = new Date();
    await note.save();

    res.json({ isFavorite, updatedAt: note.updatedAt });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Other routes
app.use('/api/summarize', verifyToken, summarizeRoute);
app.use('/api/chat', verifyToken, chatRoute);
app.use('/api/reminders', remindersRoute);
app.use('/api', userChatsRoutes);

module.exports = app;
