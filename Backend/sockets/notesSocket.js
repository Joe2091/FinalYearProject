module.exports = function setupNoteSockets(io) {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

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

    socket.on('note-deleted', ({ noteId }) => {
      socket.to(noteId).emit('note-deleted', { noteId });
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
