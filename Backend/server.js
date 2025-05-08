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
  'https://notemax.site',
  'https://www.notemax.site',
];

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (typeof origin === 'string' && origin.startsWith('chrome-extension://'))
    return true;
  return false;
}

// CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      console.log('CORS check:', origin);
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        console.error('Blocked by CORS:', origin);
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
  }),
);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../Frontend/dist-web');
app.use(express.static(frontendPath));

// Create HTTP server and Socket.IO server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      console.log('Socket.IO CORS check:', origin);
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        console.error('Socket.IO Blocked by CORS:', origin);
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Set up WebSocket and routes
require('./sockets/notesSocket')(io);
const shareNotesRoute = require('./routes/shareNotes')(io);
app.use('/api', shareNotesRoute);

// Catch-all route to serve SPA index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server with WebSocket running on http://0.0.0.0:${PORT}`);
});
