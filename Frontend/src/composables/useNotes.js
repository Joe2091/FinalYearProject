import { ref, onMounted, onBeforeUnmount, computed, reactive } from 'vue';
import {
  getNotes,
  createNote,
  deleteNote,
  updateNote,
} from '@/api/noteService';
import dayjs from 'dayjs';
import { useToastStore } from '@/stores/toastStore';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useTheme } from 'vuetify';
import { useSocket } from '@/composables/useSocket';

export function useNotes() {
  //WebSocket handlers from composable (useSocket.js)
  const {
    socket,
    joinNote,
    onNoteCreated,
    emitNoteCreated,
    emitNoteUpdate,
    onNoteUpdate,
    emitNoteDeleted,
    onNoteDeleted,
    onNoteFavorited,
    onNoteShared,
  } = useSocket();

  //Authentication and state references
  const auth = getAuth();
  const toast = useToastStore();
  const notes = ref([]);
  const newTitle = ref('');
  const newContent = ref('');
  const editingTitleId = ref(null);
  const now = ref(dayjs());
  const shareEmail = ref('');
  const theme = useTheme();
  const isDark = computed(() => theme.global.name.value === 'dark');
  const shareMenus = reactive({}); //share menu show/hide input

  const show = (msg, color = 'success') => toast.show(msg, color);

  //fetch notes for current user
  const fetchNotes = async () => {
    const currentUid = auth.currentUser?.uid;
    notes.value = await getNotes();

    //join socket rooms for real-time updates and set favourite status
    notes.value.forEach((note) => {
      joinNote(note._id);
      shareMenus[note._id] = false;
      note.isFavorite = note.favorites?.includes(currentUid);
    });
  };

  //Create new note
  const addNote = async () => {
    if (!newTitle.value.trim() || !newContent.value.trim()) {
      show('Title and content required', 'error');
      return;
    }
    const newNote = await createNote({
      title: newTitle.value,
      content: newContent.value,
      isFavorite: false,
    });

    emitNoteCreated(newNote);
    notes.value.push(newNote);
    joinNote(newNote._id);
    await fetchNotes();
    show('Note added!');
    newTitle.value = '';
    newContent.value = '';
  };

  //Delete note by ID
  const deleteNoteById = async (id) => {
    await deleteNote(id);
    emitNoteDeleted(id);
    await fetchNotes();
    show('Note deleted', 'error');
  };

  //Auto-save note after edits
  const autoSave = async (note) => {
    await updateNote(note._id, {
      title: note.title,
      content: note.content,
      isFavorite: note.isFavorite || false,
    });

    note.updatedAt = dayjs().toISOString();
    emitNoteUpdate(note._id, note.title, note.content);
    show('Note saved');
  };
  //toggle favorite status for notes
  const toggleFavorite = async (note) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post(
        `https://www.notemax.site/api/notes/${note._id}/favorite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const { isFavorite, updatedAt } = res.data;
      note.isFavorite = isFavorite;
      note.updatedAt = updatedAt;
      show(isFavorite ? 'Favorited Note' : 'Unfavorited Note');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      show('Failed to update favorite status', 'error');
    }
  };
  //Summarize note content using Azure OpenAI API
  const summarizeNote = async (note) => {
    try {
      show(`Summarizing "${note.title}"...`, 'info');
      const token = await auth.currentUser.getIdToken();
      const response = await axios.post(
        'https://www.notemax.site/api/summarize',
        { content: note.content },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      note.content = response.data.summary;
      await updateNote(note._id, {
        title: note.title,
        content: note.content,
        isFavorite: note.isFavorite,
      });
      note.updatedAt = dayjs().toISOString();
      emitNoteUpdate(note._id, note.title, note.content);
      show(`Note "${note.title}" summarized and updated!`, 'success');
    } catch (error) {
      console.error('Error summarizing note:', error);
      show('Error summarizing note', 'error');
    }
  };

  //Share a note with another using by email
  const shareNote = async (note) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        `https://www.notemax.site/api/share/${note._id}`,
        { email: shareEmail.value },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      show('Note shared successfully!', 'success');
      shareMenus[note._id] = false;
      shareEmail.value = '';
    } catch (error) {
      console.error('Error sharing note:', error);
      show(error.response?.data?.message || 'Error sharing note', 'error');
    }
  };

  //determine if note is shared with the user
  const isSharedNote = (note) => {
    const currentUid = auth.currentUser?.uid;
    return note.createdBy !== currentUid;
  };

  //truncate long note titles for display
  const truncateTitle = (title, maxLength = 18) =>
    title.length > maxLength ? title.slice(0, maxLength) + '…' : title;

  //Timer used to update timestamps showing last edit
  let timer = null;

  onMounted(() => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      socket.emit('register-user', uid);
    }
    fetchNotes();
    timer = setInterval(() => {
      now.value = dayjs();
    }, 1000);

    //Real-time note events
    onNoteCreated((note) => {
      const currentUid = auth.currentUser?.uid;
      if (
        note.createdBy === currentUid &&
        !notes.value.some((n) => n._id === note._id)
      ) {
        notes.value.push(note);
        joinNote(note._id);
      }
    });

    onNoteUpdate(({ noteId, title, content }) => {
      notes.value = notes.value.map((note) =>
        note._id === noteId
          ? { ...note, title, content, updatedAt: dayjs().toISOString() }
          : note,
      );
    });

    onNoteDeleted(({ noteId }) => {
      notes.value = notes.value.filter((n) => n._id !== noteId);
    });

    onNoteFavorited(({ noteId, isFavorite, updatedAt }) => {
      notes.value = notes.value.map((note) =>
        note._id === noteId ? { ...note, isFavorite, updatedAt } : note,
      );
    });

    onNoteShared((note) => {
      const existing = notes.value.find((n) => n._id === note._id);
      if (existing) {
        Object.assign(existing, note);
      } else {
        notes.value.push(note);
        joinNote(note._id);
        show(`Shared Note: "${note.title}"`, 'info');
      }
    });
  });

  //Format for last updated timestamps
  const formatDate = (date) => {
    const diff = now.value.diff(dayjs(date), 'minute');
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff} minutes ago`;
    return dayjs(date).format('MMM D, YYYY h:mm A');
  };

  //Cleanup on componenet unmount
  onBeforeUnmount(() => {
    clearInterval(timer);
    socket.off('note-updated');
  });

  return {
    notes,
    newTitle,
    newContent,
    editingTitleId,
    now,
    shareEmail,
    isDark,
    formatDate,
    shareMenus,
    fetchNotes,
    addNote,
    deleteNoteById,
    autoSave,
    toggleFavorite,
    summarizeNote,
    shareNote,
    isSharedNote,
    truncateTitle,
  };
}
