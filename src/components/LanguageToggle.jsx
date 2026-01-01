// src/components/LanguageToggle.jsx
import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("wikoo_language", lng);
  };

  const currentLang = i18n.language || "en";

  return (
    <div className="flex items-center gap-1 bg-white rounded-full shadow-md border border-gray-200 p-1">
      <button
        onClick={() => changeLanguage("en")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          currentLang.startsWith("en")
            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        English
      </button>

      <button
        onClick={() => changeLanguage("ta")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          currentLang.startsWith("ta")
            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        தமிழ்
      </button>

      <button
        onClick={() => changeLanguage("hi")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          currentLang.startsWith("hi")
            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}