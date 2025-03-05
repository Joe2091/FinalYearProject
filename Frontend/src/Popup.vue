<template>
    <div>
      <h2>Notes Extension</h2>
      <textarea v-model="note" placeholder="Write your note..."></textarea>
      <button @click="saveNote">Save</button>
      <p>Saved Note: {{ savedNote }}</p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        note: '',
        savedNote: ''
      };
    },
    methods: {
      saveNote() {
        chrome.storage.local.set({ note: this.note }, () => {
          console.log('Note saved!');
          this.loadNote();
        });
      },
      loadNote() {
        chrome.storage.local.get('note', (data) => {
          this.savedNote = data.note || '';
        });
      }
    },
    mounted() {
      this.loadNote();
    }
  };
  </script>
  
  <style>
  textarea {
    width: 100%;
    height: 80px;
  }
  </style>
  