import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchChatbotResponse,
  ChatHistoryItem,
} from "../api/chatbot";
import {
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaRedo,
  FaMinus,
  FaShoppingBag,
  FaStar,
} from "react-icons/fa";

/* ─────────────────────────────────────────── */
/*  Types                                       */
/* ─────────────────────────────────────────── */
interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const WELCOME_MESSAGE =
  "Xin chào! Tôi là ShopBot 🛍️ — trợ lý tư vấn sản phẩm của cửa hàng.\n\nBạn đang tìm kiếm sản phẩm gì? Hãy cho tôi biết nhu cầu của bạn nhé!";

const QUICK_SUGGESTIONS = [
  "Sản phẩm nổi bật nhất?",
  "Điện thoại dưới 10 triệu?",
  "Laptop văn phòng giá tốt?",
  "Tai nghe không dây tốt?",
];

/* ─────────────────────────────────────────── */
/*  Helpers                                     */
/* ─────────────────────────────────────────── */

/** Render văn bản chatbot — giữ xuống dòng, dấu bullet */
const BotText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-violet-400 mt-0.5 flex-shrink-0">•</span>
              <span>{trimmed.replace(/^[•\-]\s*/, "")}</span>
            </div>
          );
        }

        return <p key={i}>{trimmed}</p>;
      })}
    </div>
  );
};

/* ─────────────────────────────────────────── */
/*  AIChatbot Component                         */
/* ─────────────────────────────────────────── */
const AIChatbot: React.FC = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Khởi tạo tin nhắn chào khi mở chat */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { sender: "bot", text: WELCOME_MESSAGE, timestamp: new Date() },
      ]);
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  /* Auto scroll */
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  /* Reset chat */
  const handleReset = useCallback(() => {
    setMessages([
      { sender: "bot", text: WELCOME_MESSAGE, timestamp: new Date() },
    ]);
    setHistory([]);
    setInput("");
    setShowSuggestions(true);
  }, []);

  /* Gửi tin nhắn */
  const handleSend = useCallback(
    async (text?: string) => {
      const messageText = (text ?? input).trim();
      if (!messageText || loading) return;

      setInput("");
      setShowSuggestions(false);

      // Hiển thị tin nhắn người dùng ngay
      const userMsg: Message = {
        sender: "user",
        text: messageText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const result = await fetchChatbotResponse(messageText, history);

        const botMsg: Message = {
          sender: "bot",
          text: result.reply || "Tôi chưa hiểu yêu cầu của bạn, bạn có thể nói rõ hơn không?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);

        // Cập nhật lịch sử hội thoại
        setHistory((prev) => [
          ...prev,
          { role: "user", text: messageText },
          { role: "assistant", text: botMsg.text },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "⚠️ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau!",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [input, loading, history]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  /* ── NÚT MỞ CHAT (thu nhỏ) ── */
  if (!isOpen) {
    return (
      <button
        id="chatbot-open-btn"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-50 transition-transform hover:scale-110 active:scale-95 group"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #2563eb)",
        }}
        title="Mở tư vấn sản phẩm"
        aria-label="Mở chatbot tư vấn sản phẩm"
      >
        <FaRobot className="text-white text-2xl" />

        {/* Badge online */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-ping" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />

        {/* Tooltip */}
        <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap shadow-lg pointer-events-none">
          💬 Tư vấn sản phẩm
        </span>
      </button>
    );
  }

  /* ── KHUNG CHAT ĐẦY ĐỦ ── */
  return (
    <div
      id="chatbot-panel"
      className="fixed bottom-6 right-6 w-[370px] h-[580px] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-white/10"
      style={{ background: "#0f172a" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <FaRobot className="text-white text-lg" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm leading-tight">
              ShopBot
            </h3>
            <p className="text-blue-200 text-xs">Tư vấn sản phẩm • Trực tuyến</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Nút xem sản phẩm */}
          <button
            onClick={() => { navigate("/products"); setIsOpen(false); }}
            className="hover:bg-white/20 p-2 rounded-full transition text-white/80 hover:text-white"
            title="Xem tất cả sản phẩm"
          >
            <FaShoppingBag className="text-sm" />
          </button>
          {/* Nút chat mới */}
          <button
            onClick={handleReset}
            className="hover:bg-white/20 p-2 rounded-full transition text-white/80 hover:text-white"
            title="Cuộc trò chuyện mới"
          >
            <FaRedo className="text-sm" />
          </button>
          {/* Nút thu nhỏ */}
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-2 rounded-full transition text-white/80 hover:text-white"
            title="Thu nhỏ"
          >
            <FaMinus className="text-sm" />
          </button>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ background: "#0f172a" }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex items-end gap-2 max-w-[85%] ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              {msg.sender === "bot" && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
                  <FaRobot className="text-white text-xs" />
                </div>
              )}
              {msg.sender === "user" && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1 bg-slate-600">
                  <FaUser className="text-white text-xs" />
                </div>
              )}

              {/* Bubble */}
              <div>
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "text-white rounded-br-md"
                      : "text-slate-100 rounded-bl-md"
                  }`}
                  style={
                    msg.sender === "user"
                      ? { background: "linear-gradient(135deg, #7c3aed, #2563eb)" }
                      : { background: "#1e293b", border: "1px solid #334155" }
                  }
                >
                  {msg.sender === "bot" ? (
                    <BotText text={msg.text} />
                  ) : (
                    msg.text
                  )}
                </div>
                <p className={`text-xs text-slate-500 mt-1 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
                <FaRobot className="text-white text-xs" />
              </div>
              <div
                className="px-4 py-3 rounded-2xl rounded-bl-md"
                style={{ background: "#1e293b", border: "1px solid #334155" }}
              >
                <div className="flex items-center gap-1.5">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                  <span className="text-slate-400 text-xs ml-1">Đang soạn...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick suggestions */}
        {showSuggestions && messages.length <= 1 && !loading && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <FaStar className="text-violet-400" /> Gợi ý câu hỏi:
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-violet-500/40 text-violet-300 hover:bg-violet-500/20 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div
        className="px-4 py-3 flex-shrink-0 border-t"
        style={{ background: "#0f172a", borderColor: "#1e293b" }}
      >
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "#1e293b", border: "1px solid #334155" }}
        >
          <input
            ref={inputRef}
            id="chatbot-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi về sản phẩm..."
            className="flex-1 bg-transparent outline-none text-sm text-slate-200 placeholder-slate-500"
            disabled={loading}
            maxLength={500}
          />
          <button
            id="chatbot-send-btn"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
            aria-label="Gửi tin nhắn"
          >
            <FaPaperPlane className="text-white text-xs" />
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-1.5">
          ShopBot chỉ tư vấn sản phẩm của cửa hàng 🛍️
        </p>
      </div>
    </div>
  );
};

export default AIChatbot;
