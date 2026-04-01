// utils/chatbot/chatbotCore.js
// ============================================
// AI Chatbot tư vấn sản phẩm — đơn giản, không có agent/tool calling
// ============================================

import axios from "axios";
import Product from "../../models/ProductModel.js";
import CHATBOT_SYSTEM_PROMPT from "./chatbotPrompt.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

// Số sản phẩm tối đa đưa vào context
const MAX_PRODUCTS_IN_CONTEXT = 80;

/**
 * Lấy danh sách sản phẩm từ DB để đưa vào context cho Gemini
 */
async function getProductsContext() {
  try {
    const products = await Product.find({ countInStock: { $gt: 0 } })
      .populate("category", "name")
      .select("name price description category rating numReviews countInStock specifications")
      .limit(MAX_PRODUCTS_IN_CONTEXT)
      .lean();

    if (!products || products.length === 0) {
      return "Hiện tại cửa hàng chưa có sản phẩm nào.";
    }

    const productLines = products.map((p, idx) => {
      const cat = p.category?.name || "Chưa phân loại";
      const specs =
        p.specifications && p.specifications.length > 0
          ? p.specifications
              .slice(0, 5)
              .map((s) => `${s.key}: ${s.value}${s.unit ? s.unit : ""}`)
              .join(", ")
          : "";
      return (
        `${idx + 1}. [ID: ${p._id}] ${p.name}` +
        ` | Giá: ${p.price.toLocaleString("vi-VN")}₫` +
        ` | Danh mục: ${cat}` +
        ` | Đánh giá: ${p.rating}/5 (${p.numReviews} lượt)` +
        ` | Còn hàng: ${p.countInStock}` +
        (specs ? ` | Thông số: ${specs}` : "") +
        (p.description ? ` | Mô tả: ${p.description.substring(0, 120)}` : "")
      );
    });

    return (
      `DANH SÁCH SẢN PHẨM HIỆN CÓ TRONG CỬA HÀNG (${products.length} sản phẩm):\n` +
      productLines.join("\n")
    );
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách sản phẩm:", err.message);
    return "Không thể tải danh sách sản phẩm lúc này.";
  }
}

/**
 * Gọi Gemini API (không có function calling, chỉ text)
 */
async function callGemini(contents) {
  const maxRetries = 3;
  const baseDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔌 Calling Gemini (attempt ${attempt}/${maxRetries})...`);

      const response = await axios.post(
        `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
        {
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.9,
          },
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 25000,
        }
      );

      const candidate = response.data.candidates?.[0];
      const text = candidate?.content?.parts
        ?.filter((p) => p.text)
        .map((p) => p.text)
        .join("\n");

      if (!text) {
        throw new Error("Gemini không trả về nội dung");
      }

      console.log(`✅ Gemini phản hồi thành công`);
      return text;
    } catch (err) {
      const status = err?.response?.status;
      const isRetryable = !status || status >= 500 || status === 429;

      console.warn(`⚠️ Gemini attempt ${attempt} thất bại:`, err?.message);

      if (attempt < maxRetries && isRetryable) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 300;
        console.log(`🔄 Thử lại sau ${Math.round(delay)}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (status === 503 || err?.response?.data?.error?.status === "UNAVAILABLE") {
        return "Hệ thống đang bận. Vui lòng thử lại sau vài giây nhé! 🙏";
      }

      throw err;
    }
  }

  return "Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau! 🙏";
}

/**
 * Hàm chính: xử lý tin nhắn từ user và trả về câu trả lời
 * @param {string} message - Tin nhắn của user
 * @param {Array} history - Lịch sử hội thoại [{role, text}]
 * @returns {Promise<{reply: string, success: boolean}>}
 */
export async function runChatbot(message, history = []) {
  try {
    console.log("\n" + "=".repeat(50));
    console.log("💬 NEW CHATBOT MESSAGE:", message);
    console.log("📚 History length:", history.length);
    console.log("=".repeat(50));

    // Lấy danh sách sản phẩm từ DB
    const productsContext = await getProductsContext();

    // Xây dựng contents cho Gemini
    const contents = [];

    // Turn 1: System prompt + danh sách sản phẩm
    const systemContent = `${CHATBOT_SYSTEM_PROMPT}\n\n---\n${productsContext}`;
    contents.push({
      role: "user",
      parts: [{ text: systemContent }],
    });
    contents.push({
      role: "model",
      parts: [{ text: "Xin chào! Tôi là ShopBot 🛍️ — trợ lý tư vấn sản phẩm. Tôi đã nắm rõ danh sách sản phẩm hiện có trong cửa hàng và sẵn sàng tư vấn cho bạn!" }],
    });

    // Thêm lịch sử hội thoại (tối đa 10 lượt gần nhất)
    const recentHistory = history.slice(-10);
    for (const turn of recentHistory) {
      contents.push({
        role: turn.role === "assistant" ? "model" : "user",
        parts: [{ text: turn.text }],
      });
    }

    // Thêm message hiện tại
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Gọi Gemini
    const reply = await callGemini(contents);

    console.log("✅ Chatbot reply:", reply.substring(0, 100) + (reply.length > 100 ? "..." : ""));

    return {
      reply,
      success: true,
    };
  } catch (error) {
    console.error("❌ Chatbot error:", error.message);
    return {
      reply: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau! 🙏",
      success: false,
      error: error.message,
    };
  }
}
