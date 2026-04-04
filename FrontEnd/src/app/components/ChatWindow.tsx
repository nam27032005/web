import { useState, useEffect, useRef } from "react";
import { X, Send, User, Loader2, MessageCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import api from "../../lib/api";
import { getUserAvatar, formatDateTime, ChatMessage } from "../data/mockData";

export function ChatWindow() {
  const { activeChat, setActiveChat, sendMessage } = useApp();
  const { currentUser } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  if (!activeChat) return null;

  const partner = activeChat.partner;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;
    setLoading(true);
    await sendMessage(activeChat.id, content);
    setContent("");
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-100 dark:border-gray-700 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
            <img src={getUserAvatar(partner)} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{partner?.name || "Chủ nhà"}</p>
            <p className="text-[10px] opacity-80 uppercase tracking-wider font-medium">Trực tuyến</p>
          </div>
        </div>
        <button 
          onClick={() => setActiveChat(null)}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50"
      >
        {!activeChat.messages || activeChat.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-sm text-gray-500">Bắt đầu cuộc trò chuyện với {partner?.name}.</p>
          </div>
        ) : (
          activeChat.messages.map((msg: ChatMessage) => {
            const isMe = String(msg.senderId) === String(currentUser?.id);
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  isMe 
                    ? "bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-100" 
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm"
                }`}>
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? "text-emerald-100" : "text-gray-400"}`}>
                    {formatDateTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết tin nhắn..."
            className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white"
          />
          <button
            type="submit"
            disabled={!content.trim() || loading}
            className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-all active:scale-90"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
      </form>
    </div>
  );
}
