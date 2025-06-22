import axios from "axios";
import React, { useEffect, useState } from "react";
import "./ImageUpload.css";
import translate from "translate";

const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("+91XXXXXXXXXX");
  const [language, setLanguage] = useState("en");
  const [voices, setVoices] = useState([]);

  // ✅ Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      if (synthVoices.length > 0) setVoices(synthVoices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult("");
    }
  };

  const handleSubmit = async () => {
  if (!image) return alert("📷 Please upload an image first.");
  setLoading(true);

  const formData = new FormData();
  formData.append("image", image);
  formData.append("phone", phone);
  formData.append("language", language);

  try {
    const res = await axios.post("http://localhost:5000/api/agri/image", formData);

    const { disease, suggestion } = res.data;

    const finalResult = `🌿 रोग: ${disease.trim()}\n💡 सल्ला: ${suggestion.trim()}`
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ ]{2,}/g, " ")
      .trim();

    setResult(finalResult);
    speakText(finalResult, language);
  } catch (err) {
    console.error(err);
    setResult("❌ Failed to analyze image.");
  } finally {
    setLoading(false);
  }
};


  const handleSendToWhatsApp = async () => {
    if (!phone.trim()) return alert("📱 Enter a valid WhatsApp number.");
    if (!result.trim()) return alert("🧠 Analyze an image first.");

    try {
      await axios.post("http://localhost:5000/api/agri/image", {
        phone,
        language,
      });
      alert("✅ Message sent to WhatsApp!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send message.");
    }
  };

  const speakText = (text, langCode) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    let selectedLang = langCode === "hi" ? "hi-IN" : langCode === "mr" ? "mr-IN" : "en-US";
    let selectedVoice = voices.find((v) => v.lang === selectedLang);

    // 🛠️ Fallback
    if (!selectedVoice && langCode !== "en") {
      console.warn("⚠️ No specific voice found. Falling back.");
      selectedLang = "hi-IN";
      selectedVoice = voices.find((v) => v.lang === selectedLang);
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
        <h2>📷 Upload Crop Image</h2>

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

        <div className="file-upload-wrapper">
          <button className="glass-file-button">📤 Choose Image</button>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {preview && (
          <img src={preview} alt="preview" className="preview-img" />
        )}

        <button onClick={handleSubmit} className="glass-button">
          Analyze
        </button>

        {loading && <p className="result-text">⏳ Analyzing...</p>}

        {result && (
          <>
           <pre
  className="glass-response"
  style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", overflowY: "auto", maxHeight: "300px" }}
>
  {result}
</pre>

            <button onClick={handleSendToWhatsApp} className="glass-button">
              📩 Send to WhatsApp
            </button>
            <button
              onClick={() => speakText(result, language)}
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

export default ImageUpload;
