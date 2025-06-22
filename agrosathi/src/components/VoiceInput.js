import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VoiceInput.css";

const VoiceInput = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [messageToSend, setMessageToSend] = useState("");
  const [phone, setPhone] = useState("+91XXXXXXXXXX");
  const [language, setLanguage] = useState("en");
  const [voices, setVoices] = useState([]);

  // ✅ Load system voices once
  useEffect(() => {
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      if (synthVoices.length > 0) {
        setVoices(synthVoices);
      }
    };
    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang =
      language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = async (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);

      try {
        console.log("🎤 Heard:", speechResult);

        const res = await axios.post("http://localhost:5000/api/agri/voice", {
          query: speechResult,
          phone,
          language,
        });

        console.log("💬 Backend reply:", res.data);

        if (!res.data.reply) {
          setReply("⚠️ No suggestion from AI.");
          return;
        }

        setReply(res.data.reply);
        setMessageToSend(res.data.reply);
        speakText(res.data.reply, language);
      } catch (error) {
        console.error("❌ Error:", error);
        setReply("❌ Failed to get response.");
        setMessageToSend("❌ No suggestion.");
      }
    };

    recognition.start();
  };

  const handleSendToWhatsApp = async () => {
    if (!phone.trim()) return alert("📱 Enter a valid WhatsApp number.");
    if (!messageToSend.trim()) return alert("🎤 Please speak first.");

    try {
      await axios.post("http://localhost:5000/api/agri/send", {
        phone,
        message: messageToSend,
      });
      alert("✅ Message sent to WhatsApp!");
    } catch (error) {
      alert("❌ Failed to send WhatsApp message.");
      console.error(error);
    }
  };

  const speakText = (text, langCode) => {
    const synth = window.speechSynthesis;
    synth.cancel(); // 🛑 Stop ongoing speech

    let selectedLang =
      langCode === "hi" ? "hi-IN" :
      langCode === "mr" ? "mr-IN" :
      "en-US";

    let selectedVoice = voices.find(v => v.lang === selectedLang);

    // 🔁 Marathi fallback to Hindi
    if (langCode === "mr" && !selectedVoice) {
      console.warn("⚠️ Marathi voice not found. Falling back to Hindi.");
      selectedLang = "hi-IN";
      selectedVoice = voices.find(v => v.lang === selectedLang);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    if (selectedVoice) utterance.voice = selectedVoice;

    synth.speak(utterance);
  };

  return (
    <div
      className="module-container"
      style={{
        backgroundImage: `url("/bg.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="glass-card">
        <h2>🎤 Ask Your Farming Query</h2>

        {/* 🌐 Language Selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="glass-select"
        >
          <option value="en">🇬🇧 English</option>
          <option value="hi">🇮🇳 Hindi</option>
          <option value="mr">🇲🇷 Marathi</option>
        </select>

        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter WhatsApp number"
          className="glass-input"
        />

        <button onClick={startListening} className="glass-button">
          {listening ? "🎙️ Listening..." : "Start Speaking"}
        </button>

        {transcript && (
          <p className="result-text">
            🗣️ You said: <strong>{transcript}</strong>
          </p>
        )}

        {reply && (
          <>
            <div className="glass-response">
              <strong>AgroSathi's Suggestion:</strong>
              <p>{reply}</p>
            </div>

            <button onClick={handleSendToWhatsApp} className="glass-button">
              📩 Send to WhatsApp
            </button>

            <button
              onClick={() => speakText(reply, language)}
              className="glass-button"
            >
              🔊 Listen Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;
