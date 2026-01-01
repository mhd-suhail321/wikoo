// src/components/Login.jsx
import { useState } from "react";
import { Mail, Lock } from "lucide-react";

export default function Login({ onLogin, setCurrentPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    const user = { 
      email, 
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1) || "Friend" 
    };
    localStorage.setItem("mindbloom_user", JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-10">
          {/* Your Custom Wikoo Logo */}
          <img
            src="/Gemini_Generated_Image_ucaqlwucaqlwucaq.png"
            alt="Wikoo Logo"
            className="w-32 h-32 mx-auto mb-6 rounded-full shadow-2xl object-contain bg-gradient-to-br from-teal-400 to-blue-500 p-2"
          />
          <h1 className="text-4xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-3 text-lg">
            Continue your wellness journey 🌿
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="w-full pl-14 pr-5 py-5 rounded-2xl border border-gray-300 focus:outline-none focus:border-blue-500 text-lg transition"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full pl-14 pr-5 py-5 rounded-2xl border border-gray-300 focus:outline-none focus:border-blue-500 text-lg transition"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-center font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-5 rounded-2xl transition text-xl shadow-lg"
          >
            Login
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-600 text-lg">
            New here?{" "}
            <button
              type="button"
              onClick={() => setCurrentPage("signup")}
              className="text-blue-600 font-bold hover:underline transition"
            >
              Create an account
            </button>
          </p>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          This app provides supportive companionship only — not medical advice or therapy.
        </div>
      </div>
    </div>
  );
}