require("dotenv").config();
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const axios = require("axios");
const FormData = require("form-data");

const twilio = require("twilio");
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ✅ WhatsApp sender
const sendWhatsApp = async (to, message) => {
  try {
    const trimmed = message.length > 1597 ? message.slice(0, 1597) + "..." : message;
    const response = await client.messages.create({
      body: trimmed,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
    });
    console.log("✅ WhatsApp sent:", response.sid);
  } catch (error) {
    console.error("❌ WhatsApp error:", error.message);
  }
};

// ✅ AI Advice Generator
const generateAIAdvice = async (prompt) => {
  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are AgroSathi, a helpful Indian agricultural assistant." },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.choices[0].message.content;
  } catch (err) {
    console.error("❌ OpenRouter AI Error:", err.message);
    return "⚠️ Could not generate advice. Please try again.";
  }
};

// 🎤 Voice Query Route
router.post("/voice", async (req, res) => {
  const { query, phone, language = "en" } = req.body;

  if (!query) return res.status(400).json({ error: "Query missing." });

  let prompt = `Farmer said: "${query}". Give complete farming advice including causes, symptoms, and treatment in simple rural Indian farmer-friendly language.`;

  if (language === "hi") {
    prompt = `किसान ने कहा: "${query}"। कृपया इस पर हिंदी में कृषि सलाह दें जिसमें कारण, लक्षण और उपचार शामिल हों। सरल और उपयोगी जानकारी दें।`;
  } else if (language === "mr") {
    prompt = `शेतकऱ्याने सांगितले: "${query}"। कृपया मराठीत सविस्तर कृषी सल्ला द्या – कारणे, लक्षणे आणि उपचार यांसह. सोपी आणि उपयोगी माहिती वापरा.`;
  }

  try {
    const aiReply = await generateAIAdvice(prompt);
    const fullMessage = `🧠 AgroSathi Suggestion:\n${aiReply}`;

    if (phone) await sendWhatsApp(phone, fullMessage);

    res.json({ reply: aiReply });
  } catch (err) {
    console.error("❌ Voice Route Error:", err.message);
    res.status(500).json({ error: "AI processing failed." });
  }
});

// 📸 Image Query Route (Real model + OpenRouter)
router.post("/image", upload.single("image"), async (req, res) => {
  const { phone, language = "en" } = req.body;
  const imageBuffer = req.file?.buffer;

  if (!imageBuffer) return res.status(400).json({ error: "No image provided." });

  let result = {};

  try {
    const form = new FormData();
    form.append("image", imageBuffer, { filename: "plant.jpg" });

    const flaskRes = await axios.post("http://127.0.0.1:5000/predict", form, {
      headers: form.getHeaders(),
    });
    console.log("🔍 Flask Result:", flaskRes.data); // ADD THIS LINE


    const label_map = {
  0: "Apple___Apple_scab",
  1: "Apple___Black_rot",
  2: "Apple___Cedar_apple_rust",
  3: "Apple___healthy",
  4: "Blueberry___healthy",
  5: "Cherry_(including_sour)___Powdery_mildew",
  6: "Cherry_(including_sour)___healthy",
  7: "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
  8: "Corn_(maize)___Common_rust_",
  9: "Corn_(maize)___Northern_Leaf_Blight",
  10: "Corn_(maize)___healthy",
  11: "Grape___Black_rot",
  12: "Grape___Esca_(Black_Measles)",
  13: "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
  14: "Grape___healthy",
  15: "Orange___Haunglongbing_(Citrus_greening)",
  16: "Peach___Bacterial_spot",
  17: "Peach___healthy",
  18: "Pepper,_bell___Bacterial_spot",
  19: "Pepper,_bell___healthy",
  20: "Potato___Early_blight",
  21: "Potato___Late_blight",
  22: "Potato___healthy",
  23: "Raspberry___healthy",
  24: "Soybean___healthy",
  25: "Squash___Powdery_mildew",
  26: "Strawberry___Leaf_scorch",
  27: "Strawberry___healthy",
  28: "Tomato___Bacterial_spot",
  29: "Tomato___Early_blight",
  30: "Tomato___Late_blight",
  31: "Tomato___Leaf_Mold",
  32: "Tomato___Septoria_leaf_spot",
  33: "Tomato___Spider_mites Two-spotted_spider_mite",
  34: "Tomato___Target_Spot",
  35: "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
  36: "Tomato___Tomato_mosaic_virus",
  37: "Tomato___healthy"
};


    result.disease = flaskRes.data.class_name || "Unknown";
result.confidence = flaskRes.data.confidence;

  } catch (err) {
    console.error("❌ ML Prediction Error:", err.message);
    return res.status(500).json({ error: "Image prediction failed." });
  }

  // 🌐 Prompt based on language
  let prompt = `Explain the plant disease "${result.disease}" using:\n1. Disease Name\n2. Symptoms\n3. Causes\n4. Treatment\nUse bullet points and easy English.`;

  if (language === "hi") {
    prompt = `आप AgroSathi हैं। कृपया "${result.disease}" रोग की जानकारी दें:\n1. रोग का नाम\n2. लक्षण\n3. कारण\n4. उपचार\nसरल हिंदी में और बिंदुवार उत्तर दें।`;
  } else if (language === "mr") {
    prompt = `तुम्ही AgroSathi आहात. "${result.disease}" या रोगाची माहिती द्या:\n1. रोगाचे नाव\n2. लक्षणे\n3. कारणे\n4. उपचार\nसोप्या मराठी भाषेत आणि बुलेट पॉइंट्समध्ये उत्तर द्या.`;
  }

  try {
    const aiAdvice = await generateAIAdvice(prompt);
    const fullMessage = `📸 AgroSathi Diagnosis:\n${aiAdvice}`;
    if (phone) await sendWhatsApp(phone, fullMessage);

    res.json({
      disease: result.disease,
      confidence: result.confidence,
      suggestion: aiAdvice,
    });
  } catch (err) {
    console.error("❌ Advice Generation Error:", err.message);
    res.status(500).json({ error: "AI suggestion failed." });
  }
});

module.exports = router;
