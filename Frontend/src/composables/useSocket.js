import { io } from 'socket.io-client';
import { ref, onBeforeUnmount } from 'vue';

const socket = io('http://localhost:5000', {
  withCredentials: true,
});

const isConnected = ref(false);

// Event listeners are tracked to avoid duplicates
const joinedNotes = new Set();
const listeners = new Map();

socket.on('connect', () => {
  isConnected.value = true;
  console.log('Connected to WebSocket:', socket.id);
});

socket.on('disconnect', () => {
  isConnected.value = false;
  console.log('Disconnected from WebSocket');
});

function joinNote(noteId) {
  if (!joinedNotes.has(noteId)) {
    socket.emit('join-note', noteId);
    joinedNotes.add(noteId);
    console.log(`${noteId}`);
  }
}

function emitNoteCreated(note) {
  socket.emit('note-created', note);
}

function onNoteCreated(callback) {
  if (!listeners.has('note-created')) {
    socket.on('note-created', (note) => {
      console.log('Real-time note created:', note);
      callback(note);
    });
    listeners.set('note-created', callback);
  }
}

function emitNoteUpdate(noteId, title, content) {
  socket.emit('note-updated', { noteId, title, content });
}

function onNoteUpdate(callback) {
  if (!listeners.has('note-updated')) {
    socket.on('note-updated', (payload) => {
      console.log('update received:', payload);
      callback(payload);
    });
    listeners.set('note-updated', callback);
  }
}

function emitNoteDeleted(noteId) {
  socket.emit('note-deleted', { noteId });
}

function onNoteDeleted(callback) {
  if (!listeners.has('note-deleted')) {
    socket.on('note-deleted', (payload) => {
      console.log('Real-time note deleted:', payload);
      callback(payload);
    });
    listeners.set('note-deleted', callback);
  }
}

function emitNoteFavorited(noteId, isFavorite, updatedAt) {
  socket.emit('note-favorited', { noteId, isFavorite, updatedAt });
}

function onNoteFavorited(callback) {
  if (!listeners.has('note-favorited')) {
    socket.on('note-favorited', (payload) => {
      console.log('Favorite status changed:', payload);
      callback(payload);
    });
    listeners.set('note-favorited', callback);
  }
}

function cleanupListeners() {
  for (const [event, handler] of listeners.entries()) {
    socket.off(event, handler);
  }
  listeners.clear();
  joinedNotes.clear();
}

export function useSocket() {
  onBeforeUnmount(() => {
    cleanupListeners();
  });

  return {
    socket,
    isConnected,
    joinNote,
    onNoteCreated,
    emitNoteCreated,
    emitNoteUpdate,
    onNoteUpdate,
    emitNoteDeleted,
    onNoteDeleted,
    emitNoteFavorited,
    onNoteFavorited,
  };
}
