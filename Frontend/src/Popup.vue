<template>
  <div>
    <h2>Notes Extension</h2>
    <input v-model="newNoteTitle" placeholder="Title" />
    <textarea
      v-model="newNoteContent"
      placeholder="Write your note..."
    ></textarea>
    <button @click="addNote">Save Note</button>

    <div v-for="note in notes" :key="note._id">
      <div v-if="editingNoteId === note._id">
        <input v-model="editTitle" placeholder="Edit Title" />
        <textarea v-model="editContent" placeholder="Edit Content"></textarea>
        <button @click="saveEdit">Save</button>
        <button @click="cancelEdit">Cancel</button>
      </div>
      <div v-else>
        <h3>{{ note.title }}</h3>
        <p>{{ note.content }}</p>
        <button @click="startEditing(note)">Edit</button>
        <button @click="deleteNote(note._id)">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import {
  getNotes,
  createNote,
  deleteNote,
  updateNote,
} from "@/api/noteService";

export default {
  setup() {
    const notes = ref([]);
    const newNoteTitle = ref("");
    const newNoteContent = ref("");

    const editingNoteId = ref(null);
    const editTitle = ref("");
    const editContent = ref("");

    const fetchNotes = async () => {
      notes.value = await getNotes();
    };

    const addNote = async () => {
      const newNote = {
        title: newNoteTitle.value,
        content: newNoteContent.value,
      };
      await createNote(newNote);
      newNoteTitle.value = "";
      newNoteContent.value = "";
      fetchNotes();
    };

    const deleteNoteById = async (id) => {
      await deleteNote(id);
      fetchNotes();
    };

    const startEditing = (note) => {
      editingNoteId.value = note._id;
      editTitle.value = note.title;
      editContent.value = note.content;
    };

    const cancelEdit = () => {
      editingNoteId.value = null;
      editTitle.value = "";
      editContent.value = "";
    };

    const saveEdit = async () => {
      if (editingNoteId.value) {
        await updateNote(editingNoteId.value, {
          title: editTitle.value,
          content: editContent.value,
        });
        cancelEdit();
        fetchNotes();
      }
    };

    onMounted(fetchNotes);

    return {
      notes,
      newNoteTitle,
      newNoteContent,
      editingNoteId,
      editTitle,
      editContent,
      addNote,
      deleteNote: deleteNoteById,
      startEditing,
      cancelEdit,
      saveEdit,
    };
  },
};
</script>
