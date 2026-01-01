// src/components/ChatHistory.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bot, User, Calendar } from "lucide-react";

export default function ChatHistory() {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = () => {
      const saved = localStorage.getItem("wikoo_chat_history");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setHistory(parsed);
        } catch (e) {
          console.error("Failed to load history", e);
        }
      }
      setLoading(false);
    };

    loadHistory();
  }, []);

  // Group messages by date (simple — using current date as fallback)
  const groupByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const date = new Date().toLocaleDateString(); // In real app, save timestamp
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const groupedHistory = groupByDate(history);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 pt-20 text-center">
        <div className="animate-pulse">
          <p className="text-2xl text-gray-600">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 pt-20 text-center">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Your Chat History
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            No conversations yet 💙
          </p>
          <p className="text-lg text-gray-500">
            Start talking to Wikoo — your chats will appear here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 pt-20">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
        Your Chat History 📜
      </h2>

      <div className="space-y-12">
        {Object.entries(groupedHistory).map(([date, messages]) => (
          <div key={date} className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-center gap-3 mb-8 text-gray-600">
              <Calendar className="w-6 h-6" />
              <h3 className="text-2xl font-semibold">
                {date === new Date().toLocaleDateString() ? "Today" : date}
              </h3>
            </div>

            <div className="space-y-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-2xl px-8 py-5 rounded-3xl shadow-lg flex items-start gap-4 ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "bg-gray-50 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {msg.sender === "bot" ? (
                      <Bot className="w-7 h-7 flex-shrink-0 mt-1" />
                    ) : (
                      <User className="w-7 h-7 flex-shrink-0 mt-1" />
                    )}
                    <div className="text-lg leading-relaxed">{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}