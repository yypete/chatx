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
        <div
          class="flex flex-col items-center cursor-pointer font-bold text-[14px]"
          v-for="history in chatHistories"
          :key="history.conversationId"
          @click="loadConversation(history.conversationId)"
        >
          <div
            class="py-2 w-full overflow-hidden text-ellipsis whitespace-nowrap flex justify-center hover:bg-gray-200 hover:rounded-lg text-[14px]"
          >
            {{ history.firstMessageContent }}
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
}
export default defineComponent({
  name: "ChatGpt",
  components: {
    NewChat,
  },
  setup() {
    const chatHistories = ref<ConversationSummary[]>([]);
    const currentConversationId = ref<string>("123");
    const allConversationIds = ref<string[]>(["123", "abc", "xyz"]); // 初始对话ID
    const isSideMenuVisible = ref(true); // 添加状态控制侧边菜单显示

    function generateNewIdAndReload() {
      // 获取新的聊天历史
      const newChatHistory = getChatHistory(currentConversationId.value);
      console.log(newChatHistory);
      console.log(currentConversationId.value);
      // 判断是否存在且内容不为空
      const firstMessageContent =
        newChatHistory.length > 0 ? newChatHistory[0]?.content : "No messages";

      // 添加新的聊天历史和ID到chatHistories和allConversationIds
      if (
        newChatHistory.length > 0 &&
        !chatHistories.value.some(
          (history) => history.firstMessageContent === firstMessageContent
        )
      ) {
        chatHistories.value.push({
          conversationId: currentConversationId.value,
          firstMessageContent: firstMessageContent,
        });
        allConversationIds.value.push(currentConversationId.value); // 添加新的ID到列表中
      }
      // 生成新的随机ID
      let randomString =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      // 确保生成的随机ID不在已有的聊天历史中
      while (
        chatHistories.value.some(
          (history) => history.conversationId === randomString
        )
      ) {
        randomString =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
      }
      // 更新当前会话ID
      currentConversationId.value = randomString;
    }

    function loadConversation(conversationId: string) {
      currentConversationId.value = conversationId;
      console.log(conversationId);
    }

    function toggleSideMenu() {
      isSideMenuVisible.value = !isSideMenuVisible.value;
    }

    onMounted(() => {
      allConversationIds.value.forEach((id) => {
        const chatHistory = getChatHistory(id);
        if (chatHistory.length > 0) {
          chatHistories.value.push({
            conversationId: id,
            firstMessageContent: chatHistory[0].content,
          });
        }
      });
    });
    return {
      chatHistories,
      currentConversationId,
      generateNewIdAndReload,
      loadConversation,
      isSideMenuVisible, // 添加到返回对象中
      toggleSideMenu, // 添加到返回对象中
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
