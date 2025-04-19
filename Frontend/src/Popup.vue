<template>
  <v-app>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="1300"
      location="top"
      transition="slide-y-transition"
      class="mx-auto mt-2 elevation-6"
    >
      <v-icon start class="me-2">
        {{ snackbar.color === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle' }}
      </v-icon>
      {{ snackbar.text }}
      <template #actions>
        <v-btn icon @click="snackbar.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <v-main>
      <v-container>
        <!-- Create A Note Feature -->
        <v-card class="pa-4 mb-4">
          <v-card-title>NoteMAX</v-card-title>
          <v-text-field v-model="newTitle" label="Title" dense outlined />
          <v-textarea v-model="newContent" label="Content" dense outlined />
          <v-btn color="primary" class="mt-2" @click="addNote">Add Note</v-btn>
        </v-card>

        <!-- List of all notes -->
        <v-row>
          <v-col v-for="note in [...notes].reverse()" :key="note._id" cols="12" sm="6" md="4">
            <v-card class="pa-3">
              <div v-if="editingNoteId === note._id">
                <v-text-field v-model="editTitle" label="Title" dense outlined />
                <v-textarea v-model="editContent" label="Content" dense outlined />
                <v-btn color="primary" @click="saveEdit">Save</v-btn>
                <v-btn text @click="cancelEdit">Cancel</v-btn>
              </div>
              <div v-else>
                <h3>{{ note.title }}</h3>
                <p>{{ note.content }}</p>
                <v-btn icon @click="startEditing(note)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon color="error" @click="deleteNote(note._id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getNotes, createNote, deleteNote, updateNote } from '@/api/noteService';

export default {
  setup() {
    const notes = ref([]);
    const newTitle = ref('');
    const newContent = ref('');

    const editingNoteId = ref(null);
    const editTitle = ref('');
    const editContent = ref('');
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success',
    });

    const showToast = (message, color = 'success') => {
      snackbar.value.text = message;
      snackbar.value.color = color;
      snackbar.value.show = true;
    };

    const fetchNotes = async () => {
      notes.value = await getNotes();
    };

    const addNote = async () => {
      const newNote = {
        title: newTitle.value,
        content: newContent.value,
      };

      if (!newNote.title.trim() || !newNote.content.trim()) {
        showToast('Title and content required', 'error');
        return;
      }

      await createNote(newNote);
      await fetchNotes();
      showToast('Note added!');
      newTitle.value = '';
      newContent.value = '';
    };

    const deleteNoteById = async (id) => {
      await deleteNote(id);
      await fetchNotes();
      showToast('Note deleted', 'error');
    };

    const startEditing = (note) => {
      editingNoteId.value = note._id;
      editTitle.value = note.title;
      editContent.value = note.content;
    };

    const cancelEdit = () => {
      editingNoteId.value = null;
      editTitle.value = '';
      editContent.value = '';
    };

    const saveEdit = async () => {
      if (!editTitle.value.trim() || !editContent.value.trim()) {
        showToast('Title and content required', 'error');
        return;
      }
      if (editingNoteId.value) {
        await updateNote(editingNoteId.value, {
          title: editTitle.value,
          content: editContent.value,
        });
        await fetchNotes();
        showToast('Note updated');
        cancelEdit();
      }
    };

    onMounted(fetchNotes);

    return {
      notes,
      newTitle,
      newContent,
      editingNoteId,
      editTitle,
      editContent,
      addNote,
      deleteNote: deleteNoteById,
      startEditing,
      cancelEdit,
      saveEdit,
      snackbar,
      showToast,
    };
  },
};
</script>
