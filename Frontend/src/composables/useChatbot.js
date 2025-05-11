import { ref, computed, onMounted, watch, nextTick } from 'vue';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import MarkdownIt from 'markdown-it';
import { useToastStore } from '../stores/toastStore';

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
  const toast = useToastStore();

  //Reactive computed messages for currently selected chat
  const messages = computed(() => {
    return (
      chats.value.find((chat) => chat.id === currentChatId.value)?.messages ||
      []
    );
  });

  //Fetch chat history from backend
  async function fetchChats() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const token = await user.getIdToken();

      const res = await axios.get('https://www.notemax.site/api/getChats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Existing chats loaded or create new
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

  //Save chat history to backend
  async function saveChats() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      await axios.post(
        'https://www.notemax.site/api/saveChats',
        { chats: chats.value },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  }

  //When component mounts, load chats and scroll to bottom of chat (most recent message)
  onMounted(async () => {
    loading.value = true;
    await fetchChats();
    loading.value = false;

    nextTick(() => {
      scrollToBottom();
    });
  });

  //Automatically save chats when they change
  watch(
    chats,
    async () => {
      await saveChats();
    },
    { deep: true },
  );

  //sidebar toggle
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  //create new chat session
  function createNewChat() {
    const newChat = {
      id: Date.now().toString(),
      name: `Chat ${chats.value.length + 1}`,
      messages: [{ role: 'assistant', content: 'How can I help?' }],
      createdAt: new Date(),
    };
    chats.value.push(newChat);
    currentChatId.value = newChat.id;
    toast.show('New chat created', 'success');
  }

  //select a different chat
  function selectChat(id) {
    currentChatId.value = id;
    nextTick(() => {
      scrollToBottom();
    });
  }

  //rename a chat
  const confirmRename = (id) => {
    if (!chatNameInput.value.trim()) return;
    const chat = chats.value.find((c) => c.id === id);
    if (chat) chat.name = chatNameInput.value.trim();
    toast.show('Chat renamed', 'success');

    renameDialog.value = null;
  };

  //Delete chat by ID
  function deleteChat(id) {
    const deleted = chats.value.find((chat) => chat.id === id);
    chats.value = chats.value.filter((chat) => chat.id !== id);
    if (currentChatId.value === id) {
      currentChatId.value = chats.value[0]?.id || null;
    }
    menuChatId.value = null;
    toast.show(`Deleted chat "${deleted?.name || 'Chat'}"`, 'error');
  }

  //Scroll chat view to bottom
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

  //send a message to the chatbot and get a reply
  async function sendMessage() {
    if (userInput.value.trim() !== '') {
      const chat = chats.value.find((c) => c.id === currentChatId.value);
      if (!chat) return;

      //add user's message
      chat.messages.push({ role: 'user', content: userInput.value });
      scrollToBottom();

      userInput.value = '';

      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) throw new Error('User not authenticated');

        const token = await user.getIdToken();

        const response = await axios.post(
          'https://www.notemax.site/api/chat',
          { messages: chat.messages },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        //Add assistant's reply
        chat.messages.push({
          role: 'assistant',
          content: response.data.content,
        });
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
  //methods and properties can be used in other componenets
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
