require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Note = require('./models/Note');

const app = express();
const PORT = process.env.PORT || 5000;
const verifyToken = require('./middleware/verifyToken');
const http = require('http');
const { Server } = require('socket.io');

const allowedOrigins = [
  'chrome-extension://*', // Allows Chrome Extensions
  'http://localhost:5173',
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
// Routes Required
const summarizeRoute = require('./routes/summarize');
const chatRoute = require('./routes/chat');
const userChatsRoutes = require('./routes/userChats');
const remindersRoute = require('./routes/reminders');
require('./services/reminderScheduler');

// Connection to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Test Route
app.get('/', (req, res) => {
  res.send('Notes API is running...');
});

// Create a New Note
app.post('/api/notes', verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    const newNote = new Note({
      title,
      content,
      createdBy: req.user.uid,
    });

    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error creating note', error);
    res.status(500).json({ error: 'Error creating note' });
  }
});

// Get All Notes
app.get('/api/notes', verifyToken, async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [{ createdBy: req.user.uid }, { sharedWith: req.user.uid }],
    });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes', error);
    res.status(500).json({ error: 'Error fetching notes' });
  }
});

// Update a Note
app.put('/api/notes/:id', verifyToken, async (req, res) => {
  const { title, content, isFavorite } = req.body;

  try {
    const updatedNote = await Note.findByIdAndUpdate(
      { _id: req.params.id, createdBy: req.user.uid },
      { title, content, isFavorite },
      { new: true }, // Returns updated note
    );

    if (!updatedNote) {
      return res
        .status(404)
        .json({ message: 'Note not found or unauthorized' });
    }

    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note', error);
    res.status(500).json({ error: 'Error updating note' });
  }
});

// Delete a Note
app.delete('/api/notes/:id', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const noteId = req.params.id;

  try {
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Owner of the Note can delete it
    if (note.createdBy === userId) {
      await Note.findByIdAndDelete(noteId);
      return res.json({ message: 'Note deleted (owner)' });
    }

    // sharedWith user can remove themself from the share
    if (note.sharedWith.includes(userId)) {
      note.sharedWith = note.sharedWith.filter((uid) => uid !== userId);
      await note.save();
      return res.json({ message: 'Removed shared note for user' });
    }

    res.status(403).json({ message: 'Not authorized to delete this note' });
  } catch (error) {
    console.error('Error deleting note', error);
    res.status(500).json({ error: 'Error deleting note' });
  }
});

app.use('/api/summarize', verifyToken, summarizeRoute);
app.use('/api/chat', verifyToken, chatRoute);
app.use('/api/reminders', remindersRoute);
app.use('/api', userChatsRoutes);

// Server created with Socket.io Attached
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === 'http://localhost:5173' ||
        origin.startsWith('chrome-extension://')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

require('./sockets/notesSocket')(io);

const shareNotesRoute = require('./routes/shareNotes')(io);
app.use('/api', shareNotesRoute);

// Server Start
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server with WebSocket running on http://0.0.0.0:${PORT}`);
});
