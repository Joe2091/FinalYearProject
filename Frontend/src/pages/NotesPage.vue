<script setup>
import { ref, onMounted, onBeforeUnmount, computed, reactive } from 'vue';
import { getNotes, createNote, deleteNote, updateNote } from '@/api/noteService';
import dayjs from 'dayjs';
import { useToastStore } from '../stores/toastStore';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useTheme } from 'vuetify';
import { useSocket } from '../composables/useSocket';

const {
  socket,
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
} = useSocket();
const auth = getAuth();
const toast = useToastStore();
const notes = ref([]);
const newTitle = ref('');
const newContent = ref('');
const editingTitleId = ref(null);
const now = ref(dayjs());
const selectedNote = ref(null);
const shareEmail = ref('');
const theme = useTheme();
const isDark = computed(() => theme.global.name.value === 'dark');

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

  onNoteCreated((note) => {
    const currentUid = auth.currentUser?.uid;
    if (note.createdBy === currentUid && !notes.value.some((n) => n._id === note._id)) {
      notes.value.push(note);
      joinNote(note._id);
    }
  });

  onNoteUpdate(({ noteId, title, content }) => {
    notes.value = notes.value.map((note) =>
      note._id === noteId ? { ...note, title, content, updatedAt: dayjs().toISOString() } : note
    );
  });
  onNoteDeleted(({ noteId }) => {
    notes.value = notes.value.filter((n) => n._id !== noteId);
  });

  onNoteFavorited(({ noteId, isFavorite, updatedAt }) => {
    notes.value = notes.value.map((note) => (note._id === noteId ? { ...note, isFavorite, updatedAt } : note));
  });
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

onBeforeUnmount(() => {
  clearInterval(timer);
  socket.off('note-updated');
});

const summarizeNote = async (note) => {
  try {
    show(`Summarizing "${note.title}"...`, 'info');

    const token = await auth.currentUser.getIdToken();

    const response = await axios.post(
      'http://localhost:5000/api/summarize',
      { content: note.content },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const summary = response.data.summary;

    note.content = summary;
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

const show = (msg, color = 'success') => toast.show(msg, color);

const fetchNotes = async () => {
  notes.value = await getNotes();

  notes.value.forEach((note) => {
    joinNote(note._id);
    shareMenus[note._id] = false;
  });
};
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

const deleteNoteById = async (id) => {
  await deleteNote(id);
  emitNoteDeleted(id);
  await fetchNotes();
  show('Note deleted', 'error');
};

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

const toggleFavorite = async (note) => {
  note.isFavorite = !note.isFavorite;
  note.updatedAt = dayjs().toISOString();

  await updateNote(note._id, {
    title: note.title,
    content: note.content,
    isFavorite: note.isFavorite,
  });

  emitNoteFavorited(note._id, note.isFavorite, note.updatedAt);

  show(note.isFavorite ? 'Favorited Note' : 'Unfavorited Note');
};

onMounted(fetchNotes);
const formatDate = (date) => {
  const diff = now.value.diff(dayjs(date), 'minute');
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff} minutes ago`;
  return dayjs(date).format('MMM D, YYYY h:mm A');
};

const shareMenus = reactive({});

const handleShare = async (note) => {
  selectedNote.value = note;
  await shareNote();
  shareMenus[note._id] = false;
};

const shareNote = async () => {
  try {
    const token = await auth.currentUser.getIdToken();
    await axios.post(
      `http://localhost:5000/api/share/${selectedNote.value._id}`,
      { email: shareEmail.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    show('Note shared successfully!', 'success');
    closeShareDialog();
  } catch (error) {
    console.error('Error sharing note:', error);
    show(error.response?.data?.message || 'Error sharing note', 'error');
  }
};

const isSharedNote = (note) => {
  const currentUid = auth.currentUser?.uid;
  return note.createdBy !== currentUid;
};

const truncateTitle = (title, maxLength = 18) => {
  return title.length > maxLength ? title.slice(0, maxLength) + '…' : title;
};
</script>

<template>
  <v-container fluid class="notes-page-container">
    <!-- Create new note -->
    <v-card class="pa-4 mb-4">
      <v-card-title>NoteMAX</v-card-title>
      <v-text-field v-model="newTitle" label="Title" dense outlined />
      <v-textarea v-model="newContent" label="Content" dense outlined />
      <v-btn color="primary" class="mt-2" @click="addNote">Add Note</v-btn>
    </v-card>

    <!-- Notes grid -->
    <v-row>
      <v-col
        v-for="note in [...notes].sort((a, b) => {
          if (b.isFavorite !== a.isFavorite) {
            return b.isFavorite - a.isFavorite;
          }
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        })"
        :key="note._id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="pa-2 d-flex flex-column justify-space-between" style="min-height: 180px">
          <div class="title-wrapper" @click="editingTitleId = note._id">
            <template v-if="editingTitleId === note._id">
              <v-text-field
                v-model="note.title"
                variant="plain"
                autofocus
                dense
                hide-details
                class="mb-2"
                @blur="
                  () => {
                    autoSave(note);
                    editingTitleId = null;
                  }
                "
              />
            </template>
            <template v-else>
              <div class="truncated-title d-flex align-center">
                <!-- Title tooltip -->
                <v-tooltip location="top">
                  <template #activator="{ props }">
                    <div v-bind="props">
                      {{ truncateTitle(note.title) }}
                    </div>
                  </template>
                  <span>{{ note.title }}</span>
                </v-tooltip>

                <!-- Shared users tooltip -->
                <v-tooltip location="top" v-if="isSharedNote(note) || note.sharedWith?.length">
                  <template #activator="{ props }">
                    <v-icon v-bind="props" color="primary" size="small" class="ml-1" style="cursor: default">
                      mdi-account-multiple
                    </v-icon>
                  </template>
                  <span>
                    {{ isSharedNote(note) ? 'Shared with you' : `Shared with ${note.sharedWith?.length || 0} user(s)` }}
                  </span>
                </v-tooltip>
              </div>
            </template>
          </div>

          <!-- Content -->
          <v-textarea
            :model-value="note.content"
            @update:model-value="(val) => (note.content = val)"
            :key="note.updatedAt"
            placeholder="Start typing..."
            variant="plain"
            rows="3"
            auto-grow
            class="note-content"
            @blur="autoSave(note)"
          />
          <div class="timestamp">
            <small class="text-grey mt-1">Last updated: {{ formatDate(note.updatedAt) }}</small>
          </div>
          <!-- Actions -->
          <v-row
            justify="space-between"
            align-center
            class="note-actions"
            :style="{
              borderTop: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)',
            }"
          >
            <v-btn
              icon
              size="small"
              :color="note.isFavorite ? 'yellow-darken-2' : 'grey-lighten-2'"
              :variant="note.isFavorite ? 'elevated' : 'flat'"
              @click="toggleFavorite(note)"
            >
              <v-icon :color="note.isFavorite ? 'white' : 'grey-darken-3'">
                {{ note.isFavorite ? 'mdi-star' : 'mdi-star-outline' }}
              </v-icon>
            </v-btn>

            <v-btn icon size="small" color="info" @click="summarizeNote(note)">
              <v-icon>mdi-lightbulb-outline</v-icon>
            </v-btn>
            <v-menu v-model="shareMenus[note._id]" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-btn
                  icon
                  size="small"
                  color="primary"
                  v-bind="props"
                  :id="`share-btn-${note._id}`"
                  @click.stop="shareMenus[note._id] = true"
                >
                  <v-icon>mdi-share-variant</v-icon>
                </v-btn>
              </template>

              <v-card style="width: 300px">
                <v-card-title>Share Note</v-card-title>
                <v-card-text>
                  <v-text-field v-model="shareEmail" label="Recipient's Email" dense />
                </v-card-text>
                <v-card-actions>
                  <v-btn text @click="shareMenus[note._id] = false">Cancel</v-btn>
                  <v-btn color="primary" @click="() => handleShare(note)"> Share </v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>

            <v-btn icon size="small" class="delete-btn" @click="deleteNoteById(note._id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.note-content {
  word-break: break-word;
  white-space: pre-wrap;
}
.truncated-title {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  cursor: pointer;
}
.title-wrapper {
  width: 100%;
}
.delete-btn {
  background-color: #f44336 !important;
  color: white !important;
}

.note-actions {
  padding: 12px 24px;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.timestamp {
  margin: 11px;
}
</style>
