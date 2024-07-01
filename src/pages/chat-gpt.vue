<template>
  <div class="flex">
    <div class="side-menu border-b-2 p-3">
      <!-- header -->
      <div class="flex justify-between h-14 items-center">
        <span class="hide flex hover:bg-gray-200 hover:rounded-lg">
          <button class="h-10 rounded-lg px-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              class="icon-xl-heavy"
            ></svg>
          </button>
        </span>
        <span class="start flex hover:bg-gray-200 hover:rounded-lg">
          <button class="h-10 rounded-lg px-2" @click="generateNewIdAndReload">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
              class="icon-xl-heavy"
            ></svg>
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
            <div class="h-6 w-6 flex-shrink-0">
              <div
                class="relative flex h-full items-center justify-center rounded-full"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 41 41"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                >
                  <text x="-9999" y="-9999">ChatGPT</text>
                </svg>
              </div>
            </div>
            <div
              class="grow overflow-hidden text-ellipsis whitespace-nowrap text-sm text-token-text-primary"
            >
              New Chat
            </div>
            <div class="flex gap-3">
              <span class="flex items-center" data-state="closed">
                <button class="invisible">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  ></svg>
                </button>
              </span>
            </div>
          </a>
        </div>
        <!-- mid-history -->
        <div
          class="flex flex-col items-center cursor-pointer"
          v-for="history in chatHistories"
          :key="history.conversationId"
          @click="loadConversation(history.conversationId)"
        >
          <div class="py-2">{{ history.firstMessageContent }}</div>
        </div>
      </div>
    </div>
    <NewChat
      :conversationId="currentConversationId"
      :key="currentConversationId"
    />
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
    };
  },
});
</script>

<style scoped>
.side-menu {
  width: 260px;
  background-color: #f9f9f9;
  color: grey;
}
</style>
