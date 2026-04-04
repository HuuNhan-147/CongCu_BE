// routes/chatbotRoutes.js
// Route AI Chatbot tư vấn sản phẩm

import express from "express";
import { runChatbot } from "../utils/chatbot/chatbotCore.js";

const router = express.Router();

/**
 * POST /api/chatbot
 * Body: { message: string, history: [{role: "user"|"assistant", text: string}] }
 * Không yêu cầu đăng nhập — chatbot tư vấn công khai
 */
router.post("/", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        reply: "Vui lòng nhập tin nhắn!",
      });
    }

    console.log(`💬 Chatbot request: "${message.substring(0, 80)}..."`);

    const result = await runChatbot(message.trim(), history);

    return res.json({
      success: result.success,
      reply: result.reply,
    });
  } catch (error) {
    console.error("❌ Chatbot route error:", error);
    return res.status(500).json({
      success: false,
      reply: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!",
    });
  }
});

export default router;
