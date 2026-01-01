// src/components/WellnessTracker.jsx
import { useState, useEffect } from "react";
import { Smile, Frown, Meh } from "lucide-react";

const moods = [
  { value: "great", label: "Great", icon: Smile, color: "text-green-500" },
  { value: "good", label: "Good", icon: Smile, color: "text-blue-500" },
  { value: "okay", label: "Okay", icon: Meh, color: "text-yellow-500" },
  { value: "low", label: "Low", icon: Frown, color: "text-orange-500" },
  { value: "bad", label: "Bad", icon: Frown, color: "text-red-500" },
];

export default function WellnessTracker() {
  const [mood, setMood] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("wikoo_mood");
    if (saved) {
      setMood(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (mood) {
      localStorage.setItem("wikoo_mood", JSON.stringify(mood));
    }
  }, [mood]);

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
        How are you feeling today? 🌿
      </h2>

      <div className="bg-white rounded-3xl shadow-2xl p-10">
        <h3 className="text-2xl font-semibold text-center mb-12">
          Select your current mood
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {moods.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`p-10 rounded-3xl border-4 transition-all duration-300 shadow-lg ${
                  mood === m.value
                    ? "border-purple-500 bg-purple-50 scale-110"
                    : "border-gray-200 hover:border-purple-400 hover:scale-105"
                }`}
              >
                <Icon className={`w-24 h-24 mx-auto mb-4 ${m.color}`} />
                <p className="text-xl font-bold text-gray-800">{m.label}</p>
              </button>
            );
          })}
        </div>

        {mood && (
          <div className="text-center mt-12">
            <p className="text-2xl font-medium text-purple-700">
              Thank you for sharing. Click "Generate AI Report" to get personalized guidance 💙
            </p>
          </div>
        )}
      </div>
    </div>
  );
}