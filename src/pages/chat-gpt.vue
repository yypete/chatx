<template>
  <div class="flex flex-col md:flex-row h-screen">
    <div
      class="side-menu border-b-2 p-3 transition-all duration-500 md:w-1/4"
      :class="{ '-translate-x-full': !isSideMenuVisible }"
    >
      <!-- header -->
      <div class="flex justify-between h-14 items-center">
        <span
          class="hide flex hover:bg-gray-200 hover:rounded-lg"
          @click="toggleSideMenu"
        >
          <button class="h-10 rounded-lg px-2">
            <i class="fi fi-rr-book-arrow-right text-xl"></i>
          </button>
        </span>
        <span class="start flex hover:bg-gray-200 hover:rounded-lg">
          <button class="h-10 rounded-lg px-2" @click="generateNewIdAndReload">
            <i class="fi fi-rr-edit text-xl"></i>
          </button>
        </span>
      </div>
      <!-- mid -->
      <div
        class="flex-col flex-1 transition-opacity duration-500 -mr-2 pr-2 overflow-y-auto"
      >
        <!-- mid-start-newChat -->
        <div
          class="pb-0.5 last:pb-0 hover:bg-gray-200 hover:rounded-lg cursor-pointer"
          @click="generateNewIdAndReload"
        >
          <a
            class="group flex h-10 items-center gap-2 rounded-lg bg-token-sidebar-surface-primary px-2 font-semibold juice:gap-2.5 juice:font-normal hover:bg-token-sidebar-surface-secondary"
          >
            <div
              class="grow overflow-hidden text-ellipsis whitespace-nowrap text-sm text-token-text-primary flex items-center"
            >
              <i class="fi fi-sr-robot px-2 text-xl translate-y-0.5"></i>
              ChatGpt
            </div>
          </a>
        </div>
        <!-- mid-history -->
        <div v-for="(group, index) in groupedChatHistories" :key="index">
          <div v-if="group.label && group.histories.length > 0" class="text-left pl-6 font-bold py-2 text-sm">
            {{ group.label }}
          </div>
          <div v-for="history in group.histories" :key="history.conversationId" class="flex flex-col items-center cursor-pointer font-bold text-[14px]" @click="loadConversation(history.conversationId)">
            <div class="py-2 w-full overflow-hidden text-ellipsis whitespace-nowrap flex justify-center hover:bg-gray-200 hover:rounded-lg text-[14px]">
              {{ history.firstMessageContent }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="fixed top-4 left-3 flex items-center text-gray-500"
      v-show="!isSideMenuVisible"
    >
      <span
        class="hide flex hover:bg-gray-200 hover:rounded-lg"
        @click="toggleSideMenu"
      >
        <button class="h-10 rounded-lg px-2">
          <i class="fi fi-rr-book-arrow-right text-xl"></i>
        </button>
      </span>
      <span class="start flex hover:bg-gray-200 hover:rounded-lg">
        <button class="h-10 rounded-lg px-2" @click="generateNewIdAndReload">
          <i class="fi fi-rr-edit text-xl"></i>
        </button>
      </span>
    </div>
    <div class="chat-container flex-1 p-4">
      <NewChat
        :conversationId="currentConversationId"
        :key="currentConversationId"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { getChatHistory } from "../api/cozeApi";
import NewChat from "../components/new-chat.vue";

interface ConversationSummary {
  conversationId: string;
  firstMessageContent: string;
  timestamp: string;
}

export default defineComponent({
  name: "ChatGpt",
  components: {
    NewChat,
  },
  setup() {
    const chatHistories = ref<ConversationSummary[]>([]);
    const currentConversationId = ref<string>("123");
    const allConversationIds = ref<string[]>(["123", "abc", "xyz"]);
    const isSideMenuVisible = ref(true);

    function generateNewIdAndReload() {
      const newChatHistory = getChatHistory(currentConversationId.value);
      const firstMessageContent =
        newChatHistory.length > 0 ? newChatHistory[0]?.content : "No messages";
      const timestamp =
        newChatHistory.length > 0
          ? newChatHistory[0]?.timestamp || new Date().toISOString()
          : new Date().toISOString();

      if (
        newChatHistory.length > 0 &&
        !chatHistories.value.some(
          (history) => history.firstMessageContent === firstMessageContent
        )
      ) {
        chatHistories.value.push({
          conversationId: currentConversationId.value,
          firstMessageContent: firstMessageContent,
          timestamp: timestamp,
        });
        allConversationIds.value.push(currentConversationId.value);
      }

      let randomString =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      while (
        chatHistories.value.some(
          (history) => history.conversationId === randomString
        )
      ) {
        randomString =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
      }

      currentConversationId.value = randomString;
    }

    function loadConversation(conversationId: string) {
      currentConversationId.value = conversationId;
    }

    function toggleSideMenu() {
      isSideMenuVisible.value = !isSideMenuVisible.value;
    }

    function groupChatHistories() {
      const grouped = {
        today: [] as ConversationSummary[],
        yesterday: [] as ConversationSummary[],
        lastSevenDays: [] as ConversationSummary[],
        earlier: [] as ConversationSummary[],
      };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      chatHistories.value.forEach((history) => {
        const timestamp = new Date(history.timestamp);
        if (timestamp >= today) {
          grouped.today.push(history);
        } else if (timestamp >= yesterday) {
          grouped.yesterday.push(history);
        } else if (timestamp >= sevenDaysAgo) {
          grouped.lastSevenDays.push(history);
        } else {
          grouped.earlier.push(history);
        }
      });

      const groupedHistories = [
        { label: "今天", histories: grouped.today },
        { label: "昨天", histories: grouped.yesterday },
        { label: "前七天", histories: grouped.lastSevenDays },
        { label: null, histories: grouped.earlier },
      ];

      return groupedHistories.filter((group) => group.histories.length > 0);
    }

    onMounted(() => {
      allConversationIds.value.forEach((id) => {
        const chatHistory = getChatHistory(id);
        if (chatHistory.length > 0) {
          chatHistories.value.push({
            conversationId: id,
            firstMessageContent: chatHistory[0].content,
            timestamp: chatHistory[0].timestamp || new Date().toISOString(),
          });
        }
      });
      groupedChatHistories.value = groupChatHistories(); // Update grouped chat histories after mounting
    });

    const groupedChatHistories = ref(groupChatHistories());

    return {
      chatHistories,
      currentConversationId,
      generateNewIdAndReload,
      loadConversation,
      isSideMenuVisible,
      toggleSideMenu,
      groupedChatHistories,
    };
  },
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}
@media (min-width: 768px) {
  .container {
    flex-direction: row;
  }
}
.side-menu {
  width: 100%;
  background-color: #f9f9f9;
  color: grey;
}
@media (min-width: 768px) {
  .side-menu {
    width: 260px;
  }
}
.chat-container {
  flex: 1;
  padding: 1rem;
}
</style>
