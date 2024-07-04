<template>
  <div class="flex flex-col md:flex-row h-screen">
    <!-- Side Menu -->
    <div
      class="side-menu border-b-2 p-3 transition-all duration-500 md:w-1/4"
      :class="{ '-translate-x-full': !isSideMenuVisible }"
    >
      <!-- Header -->
      <div class="flex justify-between h-14 items-center">
        <!-- Toggle Side Menu Button -->
        <span
          class="hide flex hover:bg-gray-200 hover:rounded-lg"
          @click="toggleSideMenu"
        >
          <button class="h-10 rounded-lg px-2">
            <i class="fi fi-rr-book-arrow-right text-xl"></i>
          </button>
        </span>
        <!-- Generate New ID Button -->
        <span class="start flex hover:bg-gray-200 hover:rounded-lg">
          <button class="h-10 rounded-lg px-2" @click="generateNewIdAndReload">
            <i class="fi fi-rr-edit text-xl"></i>
          </button>
        </span>
      </div>
      <!-- Chat Histories -->
      <div
        class="flex-col flex-1 transition-opacity duration-500 -mr-2 pr-2 overflow-y-auto h-full"
      >
        <!-- Start New Chat Button -->
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
        <!-- Display Chat Histories -->
        <div v-for="(group, index) in groupedChatHistories" :key="index">
          <div
            v-if="group.label && group.histories.length > 0"
            class="text-left pl-6 font-bold py-2 text-sm"
          >
            {{ group.label }}
          </div>
          <div
            v-for="history in group.histories"
            :key="history.conversationId"
            class="relative flex items-center cursor-pointer font-bold text-[14px] px-2"
            @click="loadConversation(history.conversationId)"
            @mouseover="toggleOver(history.conversationId)"
            @mouseleave="toggleOver(history.conversationId)"
            :class="{
              'bg-gray-200 rounded-lg':
                isSelected(history.conversationId) ||
                isOver(history.conversationId),
            }"
          >
            <div
              class="flex-1 py-2 pl-10 overflow-hidden text-ellipsis whitespace-nowrap hover:bg-gray-200 hover:rounded-lg text-[14px]"
              @click="toggleButton(history.conversationId)"
            >
              {{ history.firstMessageContent }}
            </div>
            <div class="relative">
              <i
                class="dot fi fi-bs-menu-dots cursor-pointer"
                @click="toggleDropdown(history.conversationId)"
                v-show="
                  isSelected(history.conversationId) ||
                  isOver(history.conversationId)
                "
              ></i>
              <!-- Dropdown Menu -->
              <div
                v-show="isDropdownVisible[history.conversationId]"
                class="absolute right-0 mt-2 w-20 bg-white border border-gray-200 rounded-lg shadow-lg z-50 translate-x-4"
                @focusout="hideDropdown(history.conversationId)"
                tabindex="0"
              >
                <ul>
                  <li
                    class="py-2 px-4 hover:bg-gray-100 cursor-pointer text-red-400"
                    @click.stop="deleteChatHistory(history.conversationId)"
                  >
                    <i class="fi fi-rr-trash"></i>删除
                  </li>
                </ul>
              </div>
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
    <!-- Main Chat Container -->
    <div class="chat-container flex-1 p-4">
      <NewChat
        :conversationId="currentConversationId"
        :key="currentConversationId"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watchEffect } from "vue";
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
    const selectedConversationId = ref<string | null>(null);
    const hoveredConversationId = ref<string | null>(null);
    const isDropdownVisible = ref<{ [key: string]: boolean }>({});
    const groupedChatHistories = ref<any[]>([]); // Initialize groupedChatHistories as ref

    function generateNewIdAndReload() {
      const newChatHistory = getChatHistory(currentConversationId.value);

      if (newChatHistory.length > 0) {
        const newFirstMessageContent =
          newChatHistory[0]?.content || "NO Message!";
        const isDuplicate = chatHistories.value.some(
          (history) => history.firstMessageContent === newFirstMessageContent
        );

        if (!isDuplicate) {
          chatHistories.value.push({
            conversationId: currentConversationId.value,
            firstMessageContent: newFirstMessageContent,
            timestamp: newChatHistory[0]?.timestamp || new Date().toISOString(),
          });

          // Update allConversationIds
          allConversationIds.value.push(currentConversationId.value);
        }
      }

      // Generate random ID only if newChatHistory.length > 0
      if (newChatHistory.length > 0) {
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
    }

    function loadConversation(conversationId: string) {
      currentConversationId.value = conversationId;
    }

    function toggleSideMenu() {
      isSideMenuVisible.value = !isSideMenuVisible.value;
    }

    function toggleButton(conversationId: string) {
      if (selectedConversationId.value === conversationId) {
        selectedConversationId.value = null;
      } else {
        selectedConversationId.value = conversationId;
      }
    }

    function toggleOver(conversationId: string) {
      if (hoveredConversationId.value === conversationId) {
        hoveredConversationId.value = null;
      } else {
        hoveredConversationId.value = conversationId;
      }
    }

    function isSelected(conversationId: string) {
      return selectedConversationId.value === conversationId;
    }

    function isOver(conversationId: string) {
      return hoveredConversationId.value === conversationId;
    }

    function toggleDropdown(conversationId: string) {
      isDropdownVisible.value = {
        ...isDropdownVisible.value,
        [conversationId]: !isDropdownVisible.value[conversationId],
      };
    }

    function hideDropdown(conversationId: string) {
      isDropdownVisible.value = {
        ...isDropdownVisible.value,
        [conversationId]: false,
      };
    }

    function deleteChatHistory(conversationId: string) {
      chatHistories.value = chatHistories.value.filter(
        (history) => history.conversationId !== conversationId
      );
      allConversationIds.value = allConversationIds.value.filter(
        (id) => id !== conversationId
      );
      delete isDropdownVisible.value[conversationId];

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
      console.log(currentConversationId.value);
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
    });

    // Use watchEffect to automatically update groupedChatHistories
    watchEffect(() => {
      groupedChatHistories.value = groupChatHistories();
    });

    return {
      chatHistories,
      currentConversationId,
      generateNewIdAndReload,
      loadConversation,
      isSideMenuVisible,
      toggleSideMenu,
      groupedChatHistories,
      toggleButton,
      isSelected,
      toggleOver,
      isOver,
      isDropdownVisible,
      toggleDropdown,
      hideDropdown,
      deleteChatHistory,
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
.dot {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}
.dropdown-menu {
  position: absolute;
  right: 0;
  z-index: 100;
  background-color: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 0.375rem;
  margin-top: 0.5rem;
  min-width: 10rem;
}
.dropdown-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: #374151;
}
.dropdown-item:hover {
  background-color: #f3f4f6;
}
</style>
