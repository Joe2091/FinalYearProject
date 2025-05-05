const Note = require('../models/Note');
module.exports = function setupNoteSockets(io) {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('register-user', (uid) => {
      socket.join(uid);
      console.log(`Socket ${socket.id} joined user room ${uid}`);
    });

    socket.on('join-note', (noteId) => {
      socket.join(noteId);
      console.log(`User ${socket.id} joined note ${noteId}`);
    });

    socket.on('note-created', (note) => {
      socket.broadcast.emit('note-created', note);
    });

    socket.on('note-updated', ({ noteId, title, content }) => {
      socket.to(noteId).emit('note-updated', { noteId, title, content });
    });

    socket.on('note-deleted', async ({ noteId, userId }) => {
      try {
        const note = await Note.findById(noteId);
        if (!note) return;

        if (note.createdBy === userId) {
          // Owner deletes for everyone
          await Note.findByIdAndDelete(noteId);
          io.to(noteId).emit('note-deleted', { noteId });
        } else {
          // Shared user only removes it for themselves
          note.sharedWith = note.sharedWith.filter((uid) => uid !== userId);
          await note.save();

          // only applied to whoever deleted
          socket.emit('note-deleted', { noteId });
        }
      } catch (err) {
        console.error('Error handling note-deleted:', err);
      }
    });

    socket.on('note-favorited', ({ noteId, isFavorite, updatedAt }) => {
      socket
        .to(noteId)
        .emit('note-favorited', { noteId, isFavorite, updatedAt });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};
