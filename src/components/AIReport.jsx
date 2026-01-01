// src/components/AIReport.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Download, Volume2, Calendar, Mail } from "lucide-react";
import { Gauge } from "@mui/x-charts/Gauge";
import jsPDF from "jspdf";

function AIReport() {
  const { t } = useTranslation();

  const [report, setReport] = useState("");
  const [moodScore, setMoodScore] = useState(0); // -1 to 1
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const analyzeSentiment = (messages) => {
    const positiveWords = [
      "happy", "good", "great", "better", "calm", "relaxed", "thank", "love", "hope", "joy", "peace",
      "अच्छा", "खुश", "शांत", "अच्छी", "खुशी",
      "நல்ல", "மகிழ்ச்சி", "அமைதி"
    ];
    const negativeWords = [
      "sad", "stress", "anxious", "tired", "bad", "worry", "alone", "angry", "fear",
      "दुखी", "तनाव", "चिंता", "थक", "डर",
      "துக்கம்", "கவலை", "கோபம்", "பயம்"
    ];

    let score = 0;
    messages.forEach(msg => {
      const lower = msg.toLowerCase();
      positiveWords.forEach(word => { if (lower.includes(word)) score += 1; });
      negativeWords.forEach(word => { if (lower.includes(word)) score -= 1; });
    });

    if (messages.length === 0) return 0;
    return Math.max(-1, Math.min(1, score / messages.length));
  };

  const getLangCode = () => {
    const lang = i18n.language;
    if (lang.startsWith("ta")) return "ta";
    if (lang.startsWith("hi")) return "hi";
    return "en";
  };

  const getVoiceLanguage = () => {
    const lang = i18n.language;
    if (lang.startsWith("ta")) return "ta-IN";
    if (lang.startsWith("hi")) return "hi-IN";
    return "en-US";
  };

  const speakReport = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getVoiceLanguage();
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      const trySpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.lang === utterance.lang || v.lang.startsWith(utterance.lang.slice(0, 2)));
        if (preferred) utterance.voice = preferred;
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        trySpeak();
      } else {
        window.speechSynthesis.onvoiceschanged = trySpeak;
      }
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setGenerated(false);
    setReport("");

    const savedChat = localStorage.getItem("wikoo_chat_history");
    if (!savedChat || savedChat === "[]") {
      setReport(t("no_chat") || "No conversation yet — let's chat first! 💙");
      setLoading(false);
      return;
    }

    let chatHistory;
    try {
      chatHistory = JSON.parse(savedChat);
    } catch (e) {
      setReport(t("chat_error") || "Oops, something went wrong loading our chat");
      setLoading(false);
      return;
    }

    const userMessages = chatHistory
      .filter(msg => msg.sender === "user")
      .map(msg => msg.text);

    if (userMessages.length === 0) {
      setReport(t("no_chat"));
      setLoading(false);
      return;
    }

    const score = analyzeSentiment(userMessages);
    setMoodScore(score);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/report/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_context: userMessages.join("\n\n"),
          date: new Date().toLocaleDateString("en-GB"),
          lang: getLangCode(),
          mood_score: score
        }),
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();
      setReport(data.report);
      setGenerated(true);
      speakReport(data.report);
    } catch (err) {
      console.error(err);
      setReport(t("report_error") || "I'm having trouble creating your report right now. But I'm here 💙");
      setGenerated(true);
    }

    setLoading(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Wikoo Wellness Report", 20, 25);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
    const lines = doc.splitTextToSize(report, 170);
    doc.text(lines, 20, 55);
    doc.save(`Wikoo_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const moodLevel = moodScore < -0.3 ? "Feeling Low" :
                    moodScore < 0.3 ? "Balanced" :
                    "Feeling Good";

  const moodColor = moodScore > 0.3 ? "text-green-600" :
                    moodScore > -0.3 ? "text-yellow-600" :
                    "text-red-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            {t("report_title") || "Your Personalized Wellness Report"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("report_desc") || "A gentle reflection based on our conversations — just for you 🌿"}
          </p>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-16">
          <button
            onClick={generateReport}
            disabled={loading}
            className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6 px-16 rounded-3xl text-2xl shadow-2xl disabled:opacity-70 transition transform hover:scale-105"
          >
            <Sparkles className="w-10 h-10" />
            {loading ? "Creating your report..." : "Generate My Report"}
          </button>
        </div>

        {/* Report Card */}
        {generated && report && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Mood Analysis Section */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-12">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">
                Your Mood Today 🌡️
              </h2>
              <div className="max-w-md mx-auto">
                <Gauge
                  value={(moodScore + 1) * 50}
                  startAngle={-110}
                  endAngle={110}
                  height={320}
                  sx={{
                    [`& .MuiGauge-valueArc`]: {
                      fill: moodScore > 0.3 ? '#22c55e' : moodScore > -0.3 ? '#eab308' : '#ef4444',
                    },
                  }}
                />
                <div className="flex justify-between text-lg font-semibold text-gray-700 mt-8 px-12">
                  <span>Low</span>
                  <span>Balanced</span>
                  <span>Good</span>
                </div>
                <p className={`text-center text-3xl font-bold mt-8 ${moodColor}`}>
                  {moodLevel}
                </p>
              </div>
            </div>

            {/* Report Content */}
            <div className="p-12">
              <div className="prose prose-lg max-w-none text-gray-700">
                <pre className="whitespace-pre-wrap font-sans leading-relaxed text-xl">
                  {report}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 p-10 border-t">
              <div className="flex flex-col sm:flex-row justify-center gap-8">
                <button
                  onClick={() => speakReport(report)}
                  className="inline-flex items-center justify-center gap-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 px-16 rounded-2xl shadow-xl transition transform hover:scale-105 text-xl"
                >
                  <Volume2 className="w-9 h-9" />
                  Read Report Aloud
                </button>

                <button
                  onClick={downloadPDF}
                  className="inline-flex items-center justify-center gap-4 bg-green-600 hover:bg-green-700 text-white font-bold py-5 px-16 rounded-2xl shadow-xl transition transform hover:scale-105 text-xl"
                >
                  <Download className="w-9 h-9" />
                  Download as PDF
                </button>
              </div>

              {/* Google Reminders Section — Added Here */}
              <div className="mt-12 space-y-6">
                <div className="text-center">
                  <a
                    href="http://127.0.0.1:8000/api/google/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition"
                  >
                    Connect Google Account for Reminders
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={async () => {
                      const res = await fetch("http://127.0.0.1:8000/api/reminder/calendar", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: "Daily Wellness Exercise",
                          description: "From your Wikoo report — take a walk or stretch!",
                        })
                      });
                      const data = await res.json();
                      alert(data.message);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-2xl shadow-xl transition text-lg"
                  >
                    Add Exercise to Google Calendar
                  </button>

                  <button
                    onClick={async () => {
                      const res = await fetch("http://127.0.0.1:8000/api/reminder/email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          subject: "Wikoo Wellness Reminder",
                          body: "Don't forget your daily wellness activity! 🌿"
                        })
                      });
                      const data = await res.json();
                      alert(data.message);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 px-8 rounded-2xl shadow-xl transition text-lg"
                  >
                    Send Reminder to Gmail
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { AIReport };