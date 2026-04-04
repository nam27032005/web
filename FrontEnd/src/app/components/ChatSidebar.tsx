import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { getUserAvatar, formatDateTime, Conversation } from "../data/mockData";
import { MessageCircle, X, Search, Loader2 } from "lucide-react";
import api from "../../lib/api";

interface ChatSidebarProps {
  onClose: () => void;
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const { conversations, setActiveChat, markChatAsRead } = useApp();
  const { isAuthenticated } = useAuth();

  const handleSelectConv = async (conv: Conversation) => {
    // Fetch full messages when selected
    try {
      if ((conv.unreadCount ?? 0) > 0) {
        markChatAsRead(conv.id);
      }
      const res = await api.get(`/chat/conversations/${conv.id}/messages`);
      if (res.data.success) {
        setActiveChat({ ...conv, messages: res.data.messages });
        onClose();
      }
    } catch (err) {
      console.error('getMyRooms Error:', err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-2xl z-[60] flex flex-col border-l border-gray-100 dark:border-gray-700 animate-in slide-in-from-right-full duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-600 text-white">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Tin nhắn
        </h2>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm">Chưa có cuộc trò chuyện nào.</p>
            <p className="text-xs text-gray-400 mt-1">Hãy bắt đầu chat với chủ nhà để tìm hiểu thêm về phòng.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConv(conv)}
                className="w-full p-4 flex items-center gap-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors text-left group"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                    <img src={getUserAvatar(conv.partner)} alt="" className="w-full h-full object-cover" />
                  </div>
                  {(conv.unreadCount ?? 0) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-2 ring-transparent group-hover:ring-emerald-100">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {conv.partner?.name || "Người dùng"}
                    </p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                      {formatDateTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate line-clamp-1">
                    {conv.lastMessage || "Bắt đầu trò chuyện..."}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
