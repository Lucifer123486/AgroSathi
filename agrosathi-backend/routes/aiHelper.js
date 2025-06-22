// aiHelper.js
require("dotenv").config();
const axios = require("axios");

const generateAIAdvice = async (prompt) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  // Debug: log if API key is present
  console.log("🔑 API Key Loaded:", apiKey ? "✅ Present" : "❌ Missing");

  if (!apiKey) {
    console.error("❌ Missing OpenRouter API key in .env");
    return "⚠️ Missing API key.";
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert agricultural assistant." },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error("❌ OpenRouter AI Error:", err.response?.data || err.message);
    return "⚠️ Could not generate advice at the moment.";
  }
};

module.exports = generateAIAdvice;
