require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = require('./app');

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'http://178.62.76.180:5000',
];
app.use(
  cors({
    origin: (origin, callback) => {
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
  }),
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

const frontendPath = path.join(__dirname, '../Frontend/dist-web');
app.use(express.static(frontendPath));

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
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
    methods: ['GET', 'POST'],
  },
});
//test
// Setup WebSocket
require('./sockets/notesSocket')(io);

// Setup for ShareNotes
const shareNotesRoute = require('./routes/shareNotes')(io);
app.use('/api', shareNotesRoute);

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Server Start
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server with WebSocket running on http://0.0.0.0:${PORT}`);
});
