require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Create HTTP server and attach Socket.IO
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
//test
// Setup WebSocket
require('./sockets/notesSocket')(io);

// Setup for ShareNotes
const shareNotesRoute = require('./routes/shareNotes')(io);
app.use('/api', shareNotesRoute);

// Server Start
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server with WebSocket running on http://0.0.0.0:${PORT}`);
});
