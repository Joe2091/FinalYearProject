import { ref, computed, onMounted, watch, nextTick } from 'vue';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import MarkdownIt from 'markdown-it';

export function useChatbot() {
  const chats = ref([]);
  const currentChatId = ref(null);
  const menuChatId = ref(null);

  const renameDialog = ref(false);
  const renameChatId = ref(null);
  const chatNameInput = ref('');
  const userInput = ref('');
  const loading = ref(false);
  const chatContainer = ref(null);
  const md = new MarkdownIt();
  const sidebarCollapsed = ref(false);

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
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  }

  onMounted(async () => {
    loading.value = true;
    await fetchChats();
    loading.value = false;

    nextTick(() => {
      scrollToBottom();
    });
  });

  watch(
    chats,
    async () => {
      await saveChats();
    },
    { deep: true }
  );

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

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
    nextTick(() => {
      scrollToBottom();
    });
  }

  const confirmRename = (id) => {
    if (!chatNameInput.value.trim()) return;
    const chat = chats.value.find((c) => c.id === id);
    if (chat) chat.name = chatNameInput.value.trim();
    renameDialog.value = null;
  };

  function deleteChat(id) {
    chats.value = chats.value.filter((chat) => chat.id !== id);
    if (currentChatId.value === id) {
      currentChatId.value = chats.value[0]?.id || null;
    }
    menuChatId.value = null;
  }

  function scrollToBottom() {
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTo({
          top: chatContainer.value.scrollHeight,
          behavior: 'smooth',
        });
      }
    });
  }

  async function sendMessage() {
    if (userInput.value.trim() !== '') {
      const chat = chats.value.find((c) => c.id === currentChatId.value);
      if (!chat) return;

      chat.messages.push({ role: 'user', content: userInput.value });
      scrollToBottom();

      const userMessage = userInput.value;
      userInput.value = '';

      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) throw new Error('User not authenticated');

        const token = await user.getIdToken();

        const response = await axios.post(
          'http://localhost:5000/api/chat',
          { messages: chat.messages },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        chat.messages.push({ role: 'assistant', content: response.data.content });
        scrollToBottom();
      } catch (error) {
        console.error('Error getting chatbot response:', error);
        chat.messages.push({
          role: 'assistant',
          content: 'Sorry, there was an error. Please try again later.',
        });
      }
    }
  }

  return {
    chats,
    currentChatId,
    menuChatId,
    renameDialog,
    renameChatId,
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
    scrollToBottom,
    sendMessage,
  };
}
