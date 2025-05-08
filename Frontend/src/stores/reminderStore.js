import { defineStore } from 'pinia';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

export const useReminderStore = defineStore('reminder', {
  state: () => ({
    reminders: [],
  }),
  actions: {
    async fetchReminders() {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get('http://178.62.76.180:5000/api/reminders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.reminders = res.data;
    },
    async addReminder(data) {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post('http://178.62.76.180:5000/api/reminders', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.reminders.push(res.data);
    },
    async updateReminder(id, updates) {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const res = await axios.put(`http://178.62.76.180:5000/api/reminders/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const index = this.reminders.findIndex((r) => r._id === id);
      if (index !== -1) this.reminders[index] = res.data;
    },
    async deleteReminder(id) {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`http://178.62.76.180:5000/api/reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.reminders = this.reminders.filter((r) => r._id !== id);
    },
  },
});
