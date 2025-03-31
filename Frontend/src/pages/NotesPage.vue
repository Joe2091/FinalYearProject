<template>
  <v-container>
    <v-toolbar flat>
      <v-toolbar-title>NoteSpace</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-text-field
      v-model="search"
      label="Search Notes"
      prepend-icon="mdi-magnify"
      clearable
      class="mb-4"
    />

    <v-row>
      <v-col
        v-for="note in filteredNotes"
        :key="note.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card>
          <v-card-title>{{ note.title }}</v-card-title>
          <v-card-text>{{ note.content }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";

const search = ref("");
const notes = ref([
  { id: 1, title: "Note #1", content: "Summary" },
  { id: 2, title: "Note #2", content: "Shopping List" },
]);

const filteredNotes = computed(() =>
  notes.value.filter((n) =>
    n.title.toLowerCase().includes(search.value.toLowerCase())
  )
);
</script>
