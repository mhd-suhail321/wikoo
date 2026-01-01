// src/components/ChatInterface.jsx
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Send, Bot, Mic, Volume2 } from "lucide-react";
import LanguageToggle from "./LanguageToggle"; // ← Added

export default function ChatInterface() {
  const { t, i18n } = useTranslation();

  const [messages, setMessages] = useState([
    { sender: "bot", text: t("welcome_bot") }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save chat history
  useEffect(() => {
    localStorage.setItem("wikoo_chat_history", JSON.stringify(messages));
  }, [messages]);

  // Load previous chat
  useEffect(() => {
    const saved = localStorage.getItem("wikoo_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error("Failed to load chat history");
      }
    }
  }, []);

  // Get current language code for voice
  const getVoiceLanguage = () => {
    const lang = i18n.language;
    if (lang.startsWith("ta")) return "ta-IN";
    if (lang.startsWith("hi")) return "hi-IN";
    return "en-US";
  };

  // Get short language code for backend
  const getLangCode = () => {
    const lang = i18n.language;
    if (lang.startsWith("ta")) return "ta";
    if (lang.startsWith("hi")) return "hi";
    return "en";
  };

  // Voice Input
  const startListening = () => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      alert(t("voice_not_supported") || "Sorry, your browser doesn't support voice input 😔");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = getVoiceLanguage();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      alert(t("voice_error") || "Voice recognition error — please try again");
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Fixed voice output for Tamil & Hindi
  const speakText = (text) => {
    if (!("speechSynthesis" in window)) {
      alert(t("voice_not_supported"));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getVoiceLanguage();
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    const trySpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang === utterance.lang) || 
                             voices.find(v => v.lang.startsWith(utterance.lang.slice(0, 2)));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      trySpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = trySpeak;
    }
  };

  // Auto-read bot messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === "bot") {
      speakText(lastMessage.text);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          lang: getLangCode()
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { sender: "bot", text: data.reply || t("fallback_reply") || "I'm here to listen 💙" }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "bot", text: t("connection_error") || "Sorry, I'm having trouble connecting right now 😔" }]);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col pt-20">
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex mb-6 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-lg px-6 py-4 rounded-3xl shadow-lg flex items-start gap-3 ${
              msg.sender === "user"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-800 border border-gray-200"
            }`}>
              {msg.sender === "bot" && <Bot className="w-6 h-6 flex-shrink-0 mt-1" />}
              <div className="flex-1">
                {msg.text}
              </div>
              {msg.sender === "bot" && (
                <button
                  onClick={() => speakText(msg.text)}
                  className="text-gray-500 hover:text-purple-600 transition ml-2"
                  title={t("read_aloud")}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-6">
            <div className="bg-white px-6 py-4 rounded-3xl shadow-lg border border-gray-200">
              {t("thinking")}...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area with language toggle on the right */}
      <div className="border-t bg-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Language Toggle above input, aligned right */}
          <div className="flex justify-end mb-4">
            <LanguageToggle />
          </div>

          {/* Input + buttons */}
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={t("chat_placeholder")}
              className="flex-1 px-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 text-lg"
              disabled={loading || isListening}
            />
            
            <button
              onClick={startListening}
              disabled={loading || isListening}
              className={`p-4 rounded-full transition ${
                isListening 
                  ? "bg-red-500 animate-pulse" 
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white shadow-lg`}
              title={t("speak") || "Speak"}
            >
              <Mic className="w-6 h-6" />
            </button>

            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full transition shadow-lg disabled:opacity-50"
              title={t("send")}
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}