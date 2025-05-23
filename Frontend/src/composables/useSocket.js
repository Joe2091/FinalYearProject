import { io } from 'socket.io-client';
import { ref, onBeforeUnmount } from 'vue';
import { getAuth } from 'firebase/auth';

//connected to backend WebSocket server
const socket = io('https://www.notemax.site', {
  withCredentials: true,
});

const isConnected = ref(false);

// Track joined notes and registered listeners
const joinedNotes = new Set();
const listeners = new Map();

//connection status handlers
socket.on('connect', () => {
  isConnected.value = true;
});

socket.on('disconnect', () => {
  isConnected.value = false;
});

function joinNote(noteId) {
  if (!joinedNotes.has(noteId)) {
    socket.emit('join-note', noteId);
    joinedNotes.add(noteId);
  }
}

function emitNoteCreated(note) {
  socket.emit('note-created', note);
}

//Register listener for new note (real-time)
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

//listener registered for real-time updates
function onNoteUpdate(callback) {
  if (!listeners.has('note-updated')) {
    socket.on('note-updated', (payload) => {
      console.log('update received:', payload);
      callback(payload);
    });
    listeners.set('note-updated', callback);
  }
}

//listener registered for note that is shared
function onNoteShared(callback) {
  if (!listeners.has('note-shared')) {
    socket.on('note-shared', (note) => {
      console.log('Note shared:', note);
      callback(note);
    });
    listeners.set('note-shared', callback);
  }
}

function emitNoteDeleted(noteId) {
  const userId = getAuth().currentUser?.uid;
  socket.emit('note-deleted', { noteId, userId });
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

//cleanup all listeners and joined rooms when componenet unmounted
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
    onNoteShared,
  };
}
