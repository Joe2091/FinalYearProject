<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useTheme } from 'vuetify';

const theme = useTheme();
const isDark = computed(() => theme.global.name.value === 'dark');
const chats = ref([]);
const currentChatId = ref(null);
const menuChatId = ref(null);

const renameDialog = ref(false);
const renameChatId = ref(null);
const chatNameInput = ref('');
const userInput = ref('');
const loading = ref(false);

const messages = computed(() => {
  return chats.value.find((chat) => chat.id === currentChatId.value)?.messages || [];
});

async function fetchChats() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const token = await user.getIdToken();

    const res = await axios.get('http://localhost:5000/api/getChats', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data && res.data.length > 0) {
      chats.value = res.data;
      currentChatId.value = res.data[0]?.id || null;
    } else {
      createNewChat();
    }
  } catch (error) {
    console.error('Error loading chats:', error);
    createNewChat();
  }
}

async function saveChats() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const token = await user.getIdToken();

    await axios.post(
      'http://localhost:5000/api/saveChats',
      { chats: chats.value },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  } catch (error) {
    console.error('Error saving chats:', error);
  }
}

onMounted(async () => {
  loading.value = true;
  await fetchChats();
  loading.value = false;
});

watch(
  chats,
  async () => {
    await saveChats();
  },
  { deep: true }
);

function createNewChat() {
  const newChat = {
    id: Date.now().toString(),
    name: `Chat ${chats.value.length + 1}`,
    messages: [{ role: 'assistant', content: 'How can I help?' }],
    createdAt: new Date(),
  };
  chats.value.push(newChat);
  currentChatId.value = newChat.id;
}

function selectChat(id) {
  currentChatId.value = id;
}

function openRenameDialog(id) {
  const chat = chats.value.find((c) => c.id === id);
  if (!chat) return;
  chatNameInput.value = chat.name;
  renameChatId.value = id;
  renameDialog.value = true;
  menuChatId.value = null;
}

function confirmRename() {
  const chat = chats.value.find((c) => c.id === renameChatId.value);
  if (chat && chatNameInput.value.trim() !== '') {
    chat.name = chatNameInput.value.trim();
  }
  renameDialog.value = false;
  renameChatId.value = null;
}

function deleteChat(id) {
  chats.value = chats.value.filter((chat) => chat.id !== id);
  if (currentChatId.value === id) {
    currentChatId.value = chats.value[0]?.id || null;
  }
  menuChatId.value = null;
}

const sendMessage = async () => {
  if (userInput.value.trim() !== '') {
    const chat = chats.value.find((c) => c.id === currentChatId.value);
    if (!chat) return;

    chat.messages.push({ role: 'user', content: userInput.value });

    const userMessage = userInput.value;
    userInput.value = '';

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();

      const response = await axios.post(
        'http://localhost:5000/api/chat',
        { messages: chat.messages },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      chat.messages.push({ role: 'assistant', content: response.data.content });
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      chat.messages.push({
        role: 'assistant',
        content: 'Sorry, there was an error. Please try again later.',
      });
    }
  }
};
</script>

<template>
  <v-container fluid class="chatbot-container" style="display: flex; height: 100vh; flex-direction: row">
    <!-- Sidebar -->
    <v-sheet
      class="chat-sidebar"
      :color="isDark ? 'surface' : 'grey-lighten-3'"
      width="250"
      style="padding: 1rem; display: flex; flex-direction: column"
    >
      <div style="display: flex; justify-content: flex-start; margin-bottom: 1rem">
        <v-btn icon color="primary" @click="createNewChat" size="small">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>

      <div style="margin-top: 1rem; overflow-y: auto">
        <v-list dense nav>
          <v-list-item
            v-for="chat in chats"
            :key="chat.id"
            :class="{ 'selected-chat': chat.id === currentChatId }"
            @click="selectChat(chat.id)"
            class="rounded-lg pa-2 mb-2"
            style="background-color: transparent; box-shadow: none"
          >
            <v-list-item-title style="display: flex; align-items: center; justify-content: space-between; width: 100%">
              <span>{{ chat.name }}</span>

              <v-menu :close-on-content-click="false" offset-y>
                <template #activator="{ props }">
                  <v-btn icon size="x-small" v-bind="props" :id="`menu-activator-${chat.id}`" class="no-outline">
                    <v-icon size="18">mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item @click="openRenameDialog(chat.id)">
                    <v-list-item-title>Edit Name</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deleteChat(chat.id)">
                    <v-list-item-title>Delete Chat</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-title>
          </v-list-item>
        </v-list>
        <!-- Rename Chat Dialog -->
        <v-dialog v-model="renameDialog" max-width="400px">
          <v-card>
            <v-card-title>Edit Chat Name</v-card-title>
            <v-card-text>
              <v-text-field v-model="chatNameInput" label="New chat name" outlined dense />
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="renameDialog = false">Cancel</v-btn>
              <v-btn text @click="confirmRename">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-sheet>

    <div class="chat-main" style="flex: 1; display: flex; flex-direction: column">
      <v-overlay v-if="loading" absolute opacity="0.9">
        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      </v-overlay>
      <!-- Chat Messages -->
      <div class="chat-messages" style="flex: 1; overflow-y: auto; padding: 1rem">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="d-flex"
          :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            :class="[
              'chat-bubble',
              message.role === 'user'
                ? isDark
                  ? 'user-bubble-dark'
                  : 'user-bubble-light'
                : isDark
                  ? 'assistant-bubble-dark'
                  : 'assistant-bubble-light',
            ]"
          >
            {{ message.content }}
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chat-input-container" style="padding: 1rem">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <v-text-field
              v-model="userInput"
              label="Type your message..."
              append-icon="mdi-send"
              @click:append="sendMessage"
              hide-details
              dense
              outlined
              class="chat-input"
            />
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.chatbot-container {
  height: 100vh;
}

.chat-messages {
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
}

.chat-bubble {
  padding: 0.75rem 1rem;
  margin: 0.25rem;
  border-radius: 18px;
  max-width: 60%;
  word-break: break-word;
  font-size: 1rem;
  line-height: 1.4;
}

.user-bubble-light {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.user-bubble-dark {
  background-color: #1565c0;
  color: #e3f2fd;
}

.assistant-bubble-light {
  background-color: #f1f8e9;
  color: #33691e;
}

.assistant-bubble-dark {
  background-color: #33691e;
  color: #f1f8e9;
}

.chatbot-container {
  height: 100vh;
}

.chat-messages {
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
}

.chat-input-container {
  padding-bottom: 1rem;
  padding-top: 0;
}

.chat-input {
  background-color: transparent;
}

.selected-chat {
  background-color: var(--v-surface-darken1);
  border-radius: 8px;
  transition: background-color 0.3s;
}

.selected-chat:hover {
  background-color: var(--v-surface-darken2);
}

.no-outline {
  box-shadow: none !important;
  background-color: transparent !important;
  border: none !important;
}

.no-outline:hover,
.no-outline:focus,
.no-outline:active {
  background-color: transparent !important;
  box-shadow: none !important;
}
</style>
