<script setup>
import { ref, onMounted } from 'vue';
import { getNotes, createNote, deleteNote, updateNote } from '@/api/noteService';

const emit = defineEmits(['toast']);

const notes = ref([]);
const newTitle = ref('');
const newContent = ref('');
const editingTitleId = ref(null);

const summarizeNote = (note) => {
  show(`Summarize clicked for "${note.title}"`, 'info');
  // note.content will be sent to Summarization API Later in Development
};

const show = (msg, color = 'success') => emit('toast', msg, color);

const fetchNotes = async () => {
  notes.value = await getNotes();
};

const addNote = async () => {
  if (!newTitle.value.trim() || !newContent.value.trim()) {
    show('Title and content required', 'error');
    return;
  }
  await createNote({
    title: newTitle.value,
    content: newContent.value,
    isFavorite: false,
  });
  await fetchNotes();
  show('Note added!');
  newTitle.value = '';
  newContent.value = '';
};

const deleteNoteById = async (id) => {
  await deleteNote(id);
  await fetchNotes();
  show('Note deleted', 'error');
};

const autoSave = async (note) => {
  await updateNote(note._id, {
    title: note.title,
    content: note.content,
    isFavorite: note.isFavorite || false,
  });
  show('Note saved');
};

const toggleFavorite = async (note) => {
  note.isFavorite = !note.isFavorite;
  await updateNote(note._id, note);
  show(note.isFavorite ? 'Favorited!' : 'Unfavorited');
  await fetchNotes();
};

onMounted(fetchNotes);
</script>

<template>
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
      v-for="note in [...notes].sort((a, b) => b.isFavorite - a.isFavorite).reverse()"
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
            <v-tooltip location="top">
              <template #activator="{ props }">
                <div class="truncated-title" v-bind="props">
                  {{ note.title }}
                </div>
              </template>
              <span>{{ note.title }}</span>
            </v-tooltip>
          </template>
        </div>

        <!-- Content -->
        <v-textarea
          v-model="note.content"
          placeholder="Start typing..."
          variant="plain"
          rows="3"
          auto-grow
          class="note-content"
          @blur="autoSave(note)"
        />

        <!-- Actions -->
        <v-row justify="space-between" align-center class="mt-2 px-2 pb-2">
          <v-btn icon size="small" density="compact" @click="toggleFavorite(note)">
            <v-icon>{{ note.isFavorite ? 'mdi-star' : 'mdi-star-outline' }}</v-icon>
          </v-btn>

          <v-btn icon size="small" color="info" @click="summarizeNote(note)">
            <v-icon>mdi-lightbulb-outline</v-icon>
          </v-btn>

          <v-btn icon color="error" size="small" density="compact" @click="deleteNoteById(note._id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
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
</style>
