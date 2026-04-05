// api/chatbot.ts
import api from "../config/axios";

export interface ChatbotResponse {
  success: boolean;
  reply: string;
}

export interface ChatHistoryItem {
  role: "user" | "assistant";
  text: string;
}

export const fetchChatbotResponse = async (
  message: string,
  history: ChatHistoryItem[] = []
): Promise<ChatbotResponse> => {
  try {
    const response = await api.post("/chatbot", {
      message,
      history,
    });
    return response.data as ChatbotResponse;
  } catch (error: any) {
    console.error("❌ Lỗi khi gọi chatbot:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};
