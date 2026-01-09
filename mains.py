# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from openai import OpenAI
import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from datetime import datetime, timedelta
import base64
from email.mime.text import MIMEText
import requests

# === YOUR GEMINI API KEY ===
# Get your free API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY = "AIzaSyCjM3YdHHVyL7WV0f3ITreb0ObhWhpdFyI"  # ← Replace with your actual key

client = OpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

app = FastAPI(title="Wikoo Backend - Gemini + Google Integration")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Google OAuth Scopes
SCOPES = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email'
]

flow = InstalledAppFlow.from_client_secrets_file(
    'client_secrets.json',
    SCOPES
)

TOKEN_FILE = "google_token.pickle"

# Fallback clinics (unchanged)
fallback_clinics = [
    {"name": "Medanta Psychiatry", "lat": 28.4266, "lon": 77.0386, "address": "Sector 38, Gurugram", "phone": "+91-124-4141414", "website": "medanta.org"},
    {"name": "Tulasi Healthcare", "lat": 28.4565, "lon": 77.0186, "address": "Sector 56, Gurugram", "phone": "+91-8800000255", "website": "tulasihealthcare.com"},
    {"name": "Jagruti Rehab Centre", "lat": 28.4595, "lon": 77.0266, "address": "Sector 45, Gurugram", "phone": "+91-9822209770", "website": "jagrutirehab.org"},
    {"name": "Sukoon Psychiatry Centre", "lat": 28.4685, "lon": 77.0385, "address": "Sector 51, Gurugram", "phone": "+91-8448156500", "website": "sukoonhealth.com"},
    {"name": "Max Hospital Psychiatry", "lat": 28.4340, "lon": 77.0530, "address": "Sushant Lok, Gurugram", "phone": "+91-124-6623000", "website": "maxhealthcare.in"},
    {"name": "Fortis Hospital Psychiatry", "lat": 28.5100, "lon": 77.0700, "address": "Sector 44, Gurugram", "phone": "+91-124-4921021", "website": "fortishealthcare.com"},
    {"name": "Park Hospital", "lat": 28.3922, "lon": 77.3122, "address": "Sector 16, Faridabad", "phone": "+91-1800-102-6767", "website": "parkhospital.in"},
    {"name": "Asian Institute of Medical Sciences", "lat": 28.4020, "lon": 77.3100, "address": "Sector 21A, Faridabad", "phone": "+91-129-4253000", "website": "aimsindia.com"},
]

class ChatRequest(BaseModel):
    message: str
    lang: Optional[str] = "en"

class ReportRequest(BaseModel):
    chat_context: str
    date: Optional[str] = None
    lang: Optional[str] = "en"

class ReminderRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None

@app.get("/")
def home():
    return {"message": "Wikoo backend running — Gemini + Google Calendar & Gmail reminders!"}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        lang_instruction = {
            "en": "English (warm, caring, professional tone — like a supportive counselor)",
            "ta": "spoken Tamil — use caring, respectful words like நண்பா, சரி, கொஞ்சம் — speak like a trusted advisor",
            "hi": "spoken Hindi — use caring words like भाई, ठीक है, अच्छा — speak like a trusted counselor"
        }.get(request.lang, "English")

        system_prompt = f"""
        You are Wikoo — a compassionate mental wellness companion.
        Always respond ONLY in {lang_instruction}.
        Use warm, supportive, professional language.
        Be empathetic and encouraging.
        Keep responses short and meaningful (2-4 sentences).
        Use emojis sparingly.
        """

        completion = client.chat.completions.create(
            model="gemini-2.5-flash",  # Latest fast & multilingual model (as of Jan 2026)
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            temperature=0.7,
            max_tokens=300
        )

        reply = completion.choices[0].message.content.strip()
        return {"reply": reply}

    except Exception as e:
        print("Chat error:", str(e))
        fallbacks = {
            "en": "I'm here for you.",
            "ta": "நான் உங்களுக்காக இருக்கேன்.",
            "hi": "मैं आपके लिए यहाँ हूँ."
        }
        return {"reply": fallbacks.get(request.lang, "I'm here for you.")}

@app.post("/api/report/generate")
async def generate_report(request: ReportRequest):
    try:
        lang_instruction = {
            "en": "English (warm, caring, professional tone — like a trusted counselor)",
            "ta": "spoken Tamil — use caring, respectful words — write like a trusted advisor",
            "hi": "spoken Hindi — use caring words — write like a trusted counselor"
        }.get(request.lang, "English")

        prompt = f"""
        You are Wikoo — a compassionate mental wellness companion.

        Write the ENTIRE report in {lang_instruction} only.

        User shared:
        "{request.chat_context}"

        Create a caring wellness report:
        - Begin with empathy and understanding
        - Include a "Self-Care Suggestions" list with 6–8 gentle activities
        - End with encouragement and hope

        Use warm, supportive language.
        Keep tone professional yet caring.
        Use emojis sparingly.
        Length: 300–400 words.
        """

        completion = client.chat.completions.create(
            model="gemini-2.5-pro",  # Higher-capability model for detailed reports
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1200
        )

        report = completion.choices[0].message.content.strip()
        return {"report": report}

    except Exception as e:
        print("Report error:", str(e))
        fallbacks = {
            "en": "I'm having a little trouble writing the report, but I'm still here for you.",
            "ta": "அறிக்கை எழுதுவதில் சிறு சிரமம் உள்ளது, ஆனால் நான் உங்களுடன் இருக்கிறேன்.",
            "hi": "रिपोर्ट लिखने में थोड़ी दिक्कत है, लेकिन मैं आपके साथ हूँ."
        }
        return {"report": fallbacks.get(request.lang, "I'm here for you.")}

# Nearby Clinics & Google integrations remain unchanged
# ... (all other endpoints are the same as before)
