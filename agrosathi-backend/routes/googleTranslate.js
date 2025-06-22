const { Translate } = require("@google-cloud/translate").v2;

const translate = new Translate({
  keyFilename: "gcloud-key.json", // or use `key` if you directly have API key string
});

async function translateText(text, target = "hi") {
  try {
    const [translation] = await translate.translate(text, target);
    return translation;
  } catch (err) {
    console.error("❌ Translation error:", err.message);
    return text;
  }
}

module.exports = translateText;
