module.exports = function setupNoteSockets(io) {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-note', (noteId) => {
      socket.join(noteId);
      console.log(`User ${socket.id} joined note ${noteId}`);
    });

    socket.on('note-updated', ({ noteId, content }) => {
      socket.to(noteId).emit('note-updated', content);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};
