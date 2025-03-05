<template>
  <div>
    <h2>Notes Extension</h2>
    <input v-model="newNoteTitle" placeholder="Title" />
    <textarea v-model="newNoteContent" placeholder="Write your note..."></textarea>
    <button @click="addNote">Save Note</button>

    <div v-for="note in notes" :key="note._id">
      <h3>{{ note.title }}</h3>
      <p>{{ note.content }}</p>
      <button @click="deleteNote(note._id)">Delete</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { getNotes, createNote, deleteNote } from "@/api/noteService";

export default {
  setup() {
    const notes = ref([]);
    const newNoteTitle = ref("");
    const newNoteContent = ref("");

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
      fetchNotes(); // Refreshes created notes list
    };

    const deleteNoteById = async (id) => {
      await deleteNote(id);
      fetchNotes();
    };

    onMounted(fetchNotes);

    return { notes, newNoteTitle, newNoteContent, addNote, deleteNote: deleteNoteById };
  },
};
</script>
