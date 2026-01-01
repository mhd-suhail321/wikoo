// src/App.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import Login from "./components/Login";
import Signup from "./components/Signup";
import ChatInterface from "./components/ChatInterface";
import { AIReport } from "./components/AIReport";
import ChatHistory from "./components/ChatHistory";
import LanguageToggle from "./components/LanguageToggle";

import { MessageCircle, FileText, LogOut, User, ChevronDown, Clock } from "lucide-react";

function App() {
  const { t } = useTranslation();

  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("mindbloom_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setPage("chat");
    }
  }, []);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      const loadVoices = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage("chat");
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setPage("login");
    setShowProfileMenu(false);
  };

  if (!user) {
    return page === "login" ? (
      <Login onLogin={handleLogin} setCurrentPage={setPage} />
    ) : (
      <Signup onLogin={handleLogin} setCurrentPage={setPage} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 relative">
      <LanguageToggle />

      <header className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          {/* Logo + App Name */}
          <div className="flex items-center gap-4">
            <img
              src="/Gemini_Generated_Image_ucaqlwucaqlwucaq.png"
              alt="Wikoo Logo"
              className="w-14 h-14 rounded-full shadow-xl object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t("app_name")}</h1>
              <p className="text-sm text-gray-600">
                {t("greeting")}, {user.name || user.email.split("@")[0]} 🌿
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-10">
            <button
              onClick={() => setPage("chat")}
              className={`flex items-center gap-2 text-lg font-medium transition ${
                page === "chat"
                  ? "text-blue-600 border-b-4 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <MessageCircle className="w-6 h-6" /> {t("chat")}
            </button>

            <button
              onClick={() => setPage("report")}
              className={`flex items-center gap-2 text-lg font-medium transition ${
                page === "report"
                  ? "text-blue-600 border-b-4 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <FileText className="w-6 h-6" /> {t("report")}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium"
              >
                <User className="w-6 h-6" />
                <span>{user.name || user.email.split("@")[0]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                  <button
                    onClick={() => {
                      setPage("history");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-6 py-4 hover:bg-gray-100 flex items-center gap-4 transition"
                  >
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">View History</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-6 py-4 hover:bg-red-50 text-red-600 flex items-center gap-4 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <div className="bg-amber-50 text-amber-800 text-center py-2 text-sm font-medium">
        ⚠️ {t("disclaimer")}
      </div>

      <main className="pt-4">
        {page === "chat" && <ChatInterface />}
        {page === "report" && <AIReport />}
        {page === "history" && <ChatHistory />}
      </main>
    </div>
  );
}

export default App;