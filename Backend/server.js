require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const verifyToken = require('./middleware/verifyToken');

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
// Note AI summary
const summarizeRoute = require('./routes/summarize');

// Connection to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Note Schema
const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: { type: String, required: true },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Create Note Model
const Note = mongoose.model('Note', noteSchema);

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
    const notes = await Note.find({ createdBy: req.user.uid });
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
  try {
    await Note.findByIdAndDelete({
      _id: req.params.id,
      createdBy: req.user.uid,
    });

    if (!Note) {
      return res
        .status(404)
        .json({ message: 'Note not found or unauthorized' });
    }

    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Error deleting note', error);
    res.status(500).json({ error: 'Error deleting note' });
  }
});

app.use('/api/summarize', verifyToken, summarizeRoute);

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
