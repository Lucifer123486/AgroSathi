# 🌾 AgroSathi – AI-Powered Rural Companion for Smart Farming

AgroSathi is a multilingual, AI-integrated smart farming assistant that helps farmers detect plant diseases using images and get personalized voice/text-based agricultural advice in native Indian languages like Marathi and Hindi.

---

## 📁 Project Structure

AgroSathi/
├── agrosathi/ # React frontend
├── agrosathi-backend/ # Node.js + Express backend
├── agrosathi-ml/ # Flask + TFLite ML API


---

## 🧠 Features

- 📸 Image-based Plant Disease Detection (TFLite model)
- 🎤 Voice query with AI-generated farming advice (OpenRouter + Google TTS)
- 🌐 Multilingual support: English, Marathi, Hindi
- 🔗 WhatsApp message delivery for rural connectivity
- 🧑‍🌾 Personalized responses based on image or voice input

---

## 🚀 How to Run Locally

### 1. Clone the Repo

```bash
git clone https://github.com/Lucifer123486/AgroSathi.git
cd AgroSathi



2. Setup and Start ML Model Server (Flask)

cd agrosathi-ml
pip install -r requirements.txt
python app.py

Make sure model.tflite and labels.txt are in the agrosathi-ml folder.

3. Setup and Start Backend (Node.js + Express)

cd ../agrosathi-backend
npm install
node index.js

This handles the AI integration via OpenRouter, routes for image/voice analysis, and WhatsApp message generation.

4. Setup and Start Frontend (React.js)

cd ../agrosathi
npm install
npm start

Accessible at http://localhost:3000

🌐 Tech Stack

| Layer     | Tech                             |
| --------- | -------------------------------- |
| Frontend  | React.js                         |
| Backend   | Node.js + Express                |
| ML Server | Python + Flask + TensorFlow Lite |
| AI API    | OpenRouter (ChatGPT-compatible)  |
| Voice     | Google Text-to-Speech (TTS)      |
| Hosting   | Local (Google Cloud optional)    |

🧪 ML Model Info
Format: model.tflite

Classes: Multiple plant diseases (e.g., Apple scab, Marssonina leaf spot, Cedar Apple Rust, etc.)

Input: Leaf image (.jpg, .png)

Output: Disease name + AI-based cure/advice

## 📱 WhatsApp Integration

AgroSathi integrates with WhatsApp to deliver personalized farming advice directly to the farmer's phone.

### 💡 How it Works:

- After submitting a voice query or image, the system generates disease detection + AI-generated advice.
- The advice is automatically sent to the farmer's WhatsApp number using the Twilio API.

### ⚠️ Note:

This project uses **Twilio Sandbox for WhatsApp**, so:

- ✅ Only **verified numbers** (i.e., numbers you've added to Twilio Sandbox) can receive WhatsApp messages.
- ❌ Other random numbers will **not receive** messages unless added and verified via Twilio Console.

### 🔗 Sample Message Sent:

🌾 AgroSathi Plant Diagnosis Report 🌿

🩺 Detected Disease: Apple Scab
💡 Advice: Spray with copper-based fungicide. Keep leaves dry. Remove infected leaves.

🗣️ Language: Marathi (Voice response available)


> The advice is trimmed to be under **1600 characters** to ensure it fits within WhatsApp's message limit.

🌐 Multilingual Support
React UI toggle for language switch (English ↔ Hindi ↔ Marathi)

Voice output in local language via Google TTS

🤖 AI Prompt Logic
Used for OpenRouter API:

You are AgroSathi, an AI assistant for Indian farmers.
Explain the following plant disease in very simple language along with its treatment:
<Predicted Disease>

👨‍💻 Developed By
Team mayurpatiltae
👤 Mayur Patil – Full-stack + ML integration
🏫 Trinity Academy of Engineering
📞 9767550382
