<script setup>
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import { useChatbot } from '@/composables/useChatbot';

const theme = useTheme();
const isDark = computed(() => theme.global.name.value === 'dark');

const {
  chats,
  currentChatId,
  renameDialog,
  chatNameInput,
  userInput,
  loading,
  chatContainer,
  md,
  sidebarCollapsed,
  messages,
  toggleSidebar,
  createNewChat,
  selectChat,
  confirmRename,
  deleteChat,
  sendMessage,
} = useChatbot();
</script>

<template>
  <v-container
    fluid
    class="chatbot-container"
    style="display: flex; height: 100vh; flex-direction: row"
  >
    <!-- Sidebar -->
    <v-sheet
      class="chat-sidebar"
      :color="isDark ? 'surface' : 'grey-lighten-3'"
      :width="sidebarCollapsed ? 55 : 250"
      style="
        transition:
          width 0.3s ease,
          padding 0.3s ease;
        overflow-x: hidden;
      "
    >
      <div
        style="
          display: flex;
          justify-content: center;
          margin-bottom: 8px;
          padding-top: 5px;
        "
      >
        <v-btn
          icon
          size="small"
          @click="toggleSidebar"
          style="margin-bottom: 8px"
        >
          <v-icon>{{
            sidebarCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'
          }}</v-icon>
        </v-btn>
      </div>

      <v-divider class="my-2"></v-divider>
      <div
        style="
          display: flex;
          justify-content: center;
          margin-bottom: 8px;
          padding-top: 5px;
        "
      >
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
            class="rounded-lg pa-2 mb-2"
            style="background-color: transparent; box-shadow: none"
            @click="selectChat(chat.id)"
          >
            <template v-if="renameDialog === chat.id">
              <v-text-field
                v-model="chatNameInput"
                dense
                placeholder="Rename chat"
                @keyup.enter="confirmRename(chat.id)"
                @blur="confirmRename(chat.id)"
                hide-details
                autofocus
              />
            </template>

            <template v-else>
              <v-list-item-title
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  width: 100%;
                "
              >
                <v-tooltip location="top">
                  <template #activator="{ props }">
                    <span
                      v-bind="props"
                      style="
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        max-width: 160px;
                      "
                    >
                      {{ chat.name }}
                    </span>
                  </template>
                  <span>{{ chat.name }}</span>
                </v-tooltip>

                <v-menu :close-on-content-click="false" offset-y>
                  <template #activator="{ props }">
                    <v-btn
                      icon
                      size="x-small"
                      v-bind="props"
                      class="no-outline"
                    >
                      <v-icon size="18">mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list>
                    <v-list-item
                      @click.stop="
                        () => {
                          renameDialog = chat.id;
                          chatNameInput = chat.name;
                        }
                      "
                    >
                      <v-list-item-title>Edit Name</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click.stop="deleteChat(chat.id)">
                      <v-list-item-title>Delete Chat</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item-title>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </v-sheet>

    <div
      class="chat-main"
      style="flex: 1; display: flex; flex-direction: column"
    >
      <v-overlay v-if="loading" absolute opacity="0.9">
        <v-progress-circular
          indeterminate
          size="64"
          color="primary"
        ></v-progress-circular>
      </v-overlay>
      <!-- Chat Messages -->
      <div
        ref="chatContainer"
        class="chat-messages"
        style="flex: 1; overflow-y: auto; padding: 1rem"
      >
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
            <div class="markdown" v-html="md.render(message.content)"></div>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chat-input-container" style="padding: 1rem">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <v-textarea
              v-model="userInput"
              label="Type your message..."
              append-icon="mdi-send"
              @click:append="sendMessage"
              hide-details
              dense
              outlined
              class="chat-input"
              rows="1"
              auto-grow
              max-rows="3"
            />
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.chatbot-container {
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
}

.chat-messages {
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
}

.chat-bubble {
  padding: 1rem 1.25rem;
  margin: 0.5rem;
  border-radius: 18px;
  max-width: min(85vw, 550px);
  word-break: break-word;
  font-size: 1rem;
  line-height: 1.5;
}

.chat-bubble .markdown {
  padding-left: 0.5rem;
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

.scroll-to-bottom {
  position: fixed;
  bottom: 80px;
  right: 24px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>
