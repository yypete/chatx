import axios, { AxiosInstance } from "axios";

// 定义 API 的基础 URL 和常量
const API_URL = "https://api.coze.com/open_api/v2";
const ACCESS_TOKEN =
  "pat_BbbwKPRbbsMKUdkWloven6v6zToDkmayX30fDW9wCwjbOwu6SBdNgQ7u1AUGupjG";
const BOT_ID = "7386497524418658309";

// 创建一个带有默认配置的 Axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
});

// 定义聊天消息和聊天历史记录对象的接口
interface ChatHistoryItem {
  role: string;
  content: string;
  content_type: string;
  type?: string; // 可选字段，根据实际需求添加或删除
}

// 发送消息并收到回复的函数
export const sendMessage = async (
  conversationId: string,
  userId: string,
  query: string,
  chatHistory: ChatHistoryItem[]
) => {
  try {
    const response = await apiClient.post("/chat", {
      conversation_id: conversationId,
      bot_id: BOT_ID,
      user: userId,
      query,
      stream: false,
      chat_history: chatHistory,
    });
    console.log(response);
    return response.data;
  } catch (error: any) {
    throw new Error(`发送消息失败: ${error.message}`);
  }
};

export const storeChatHistory = (
  conversationId: string,
  chatHistory: ChatHistoryItem[]
) => {
  const timestamp = new Date().toISOString();
  sessionStorage.setItem(
    `chatHistory-${conversationId}`,
    JSON.stringify(chatHistory)
  );
  sessionStorage.setItem(`chatHistoryTimestamp-${conversationId}`, timestamp);
};

export const getChatHistory = (conversationId: string): ChatHistoryItem[] => {
  const storedChatHistory = sessionStorage.getItem(
    `chatHistory-${conversationId}`
  );
  return storedChatHistory ? JSON.parse(storedChatHistory) : [];
};

export const getChatHistoryTimestamp = (
  conversationId: string
): string | null => {
  return sessionStorage.getItem(`chatHistoryTimestamp-${conversationId}`);
};
