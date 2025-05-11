<script setup>
import { ref, onMounted, computed } from 'vue';
import { useReminderStore } from '@/stores/reminderStore';
import { storeToRefs } from 'pinia';
import { useToastStore } from '@/stores/toastStore';
import { useTheme } from 'vuetify';
import ReminderList from '@/components/ReminderList.vue';

const theme = useTheme();
const isDark = computed(() => theme.global.name.value === 'dark');
const isExtension = window.location.protocol === 'chrome-extension:';

//store initialization and reactive refs
const store = useReminderStore();
const toast = useToastStore();
const { reminders } = storeToRefs(store);

const newReminder = ref({ title: '', datetime: '', content: '' }); // form for creat/edit reminder
const editingIndex = ref(null); // Tracks reminder editing

//Fetch reminders and request notification permissions on mount
onMounted(() => {
  store.fetchReminders().then(() => {
    reminders.value.forEach(scheduleNotification);
  });
  //Ask for browser notification permissions
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
});

//add or update reminder logic
async function addReminder() {
  if (!newReminder.value.title || !newReminder.value.datetime) {
    return toast.show('Please enter a title and date/time.', 'error');
  }

  const selectedDate = new Date(newReminder.value.datetime);
  const year = selectedDate.getFullYear();

  if (year < 2024 || year > 2100) {
    toast.show('Please select a valid year between 2024 and 2100.', 'error');
    return;
  }

  const utcISO = selectedDate.toISOString();

  const payload = {
    ...newReminder.value,
    datetime: utcISO,
  };

  //update existing reminder
  if (editingIndex.value !== null) {
    const id = reminders.value[editingIndex.value]._id;
    await store.updateReminder(id, payload);
    toast.show('Reminder updated', 'success');
    editingIndex.value = null;
  } else {
    //Add new reminder
    await store.addReminder(payload);
    toast.show('Reminder added', 'success');
  }

  scheduleNotification(payload); //Schedule notification
  newReminder.value = { title: '', datetime: '', content: '' }; //reset form
}

//prepare form to edit reminder
function editReminder(reminder) {
  const index = reminders.value.findIndex((r) => r._id === reminder._id);
  if (index === -1) return;

  editingIndex.value = index;
  newReminder.value = { ...reminder };
}

//delete reminder by ID
async function deleteReminder(reminder) {
  const index = reminders.value.findIndex((r) => r._id === reminder._id);
  if (index === -1) return;

  if (confirm('Are you sure you want to delete this reminder?')) {
    await store.deleteReminder(reminder._id);
    toast.show('Reminder deleted', 'error');
  }
}

//Browser/extension notification scheduled
function scheduleNotification(rem) {
  const dt = new Date(rem.datetime).getTime() - Date.now();
  if (dt > 0 && dt < 86400000) {
    setTimeout(() => {
      //Chrome extension notification
      if (isExtension && chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'show-notification',
          message: `Reminder: ${rem.title}`,
        });
      }
      //normal browser notificaiton
      else if (Notification.permission === 'granted') {
        new Notification(`Reminder: ${rem.title}`, {
          body: new Date(rem.datetime).toLocaleString(),
          requireInteraction: true,
        });
      }
    }, dt);
  }
}
//tab state and filtering logic for reminder tabs
const selectedTab = ref('upcoming');

const upcomingReminders = computed(() =>
  reminders.value
    .filter((r) => new Date(r.datetime) > new Date())
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime)),
);
const pastReminders = computed(() =>
  reminders.value
    .filter((r) => new Date(r.datetime) <= new Date())
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime)),
);
const allReminders = computed(() =>
  reminders.value
    .slice()
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime)),
);
</script>

<template>
  <v-container
    fluid
    class="d-flex justify-center align-start reminder-container"
  >
    <v-col cols="12" sm="10" md="8" lg="6">
      <h2 class="text-h6 font-weight-bold mb-4 text-center">Reminders</h2>

      <!-- Add new Reminder Form -->
      <v-card
        class="mb-6 pa-4 rounded-lg elevation-2"
        :class="{
          'reminder-card-dark': isDark,
          'reminder-card-light': !isDark,
        }"
      >
        <v-text-field
          v-model="newReminder.title"
          label="Title"
          dense
          outlined
          class="mb-3"
        />
        <v-text-field
          v-model="newReminder.datetime"
          label="Date & Time"
          type="datetime-local"
          dense
          outlined
          class="mb-4"
        />
        <v-textarea
          v-model="newReminder.content"
          label="Notes (optional)"
          dense
          outlined
          class="mb-4"
        />
        <v-btn color="primary" block @click="addReminder">
          {{ editingIndex !== null ? 'Update Reminder' : 'Add Reminder' }}
        </v-btn>
      </v-card>

      <v-tabs v-model="selectedTab" class="mb-4">
        <v-tab value="upcoming">Upcoming</v-tab>
        <v-tab value="past">Past</v-tab>
        <v-tab value="all">All</v-tab>
      </v-tabs>

      <v-window v-model="selectedTab">
        <v-window-item value="upcoming">
          <ReminderList
            :items="upcomingReminders"
            icon="mdi-timer-outline"
            empty-icon="mdi-clock-alert-outline"
            empty-text="No upcoming reminders"
            :highlight-past="false"
            :editable="true"
            @edit="editReminder"
            @delete="deleteReminder"
          />
        </v-window-item>

        <v-window-item value="past">
          <ReminderList
            :items="pastReminders"
            icon="mdi-history"
            empty-icon="mdi-history"
            empty-text="No past reminders"
            :highlight-past="true"
            :editable="false"
          />
        </v-window-item>

        <v-window-item value="all">
          <ReminderList
            :items="allReminders"
            icon="mdi-bell-outline"
            empty-icon="mdi-bell-off"
            empty-text="No reminders"
            :highlight-past="true"
            :editable="false"
          />
        </v-window-item>
      </v-window>
    </v-col>
  </v-container>
</template>

<style scoped>
.reminder-container {
  padding: 32px 16px;
}
.reminder-card-dark {
  background: #1e1e1e;
  color: white;
}
.reminder-card-light {
  background: #fff;
  color: black;
}
</style>
