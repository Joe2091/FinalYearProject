import { defineStore } from 'pinia';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

// Pinia store for managing user reminders
export const useReminderStore = defineStore('reminder', {
  state: () => ({
    reminders: [], // Reminders for the logged-in user
  }),
  actions: {
    //Fetch all reminders from server
    async fetchReminders() {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get('https://www.notemax.site/api/reminders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.reminders = res.data;
    },

    //Add a new reminder and update local state
    async addReminder(data) {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post(
        'https://www.notemax.site/api/reminders',
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      this.reminders.push(res.data);
    },

    //Update an existing reminder and replace it in local state
    async updateReminder(id, updates) {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const res = await axios.put(
        `https://www.notemax.site/api/reminders/${id}`,
        updates,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const index = this.reminders.findIndex((r) => r._id === id);
      if (index !== -1) this.reminders[index] = res.data;
    },

    //Delete reminder from both server and local
    async deleteReminder(id) {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`https://www.notemax.site/api/reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.reminders = this.reminders.filter((r) => r._id !== id);
    },
  },
});
