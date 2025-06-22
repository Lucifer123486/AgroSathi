from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

# ✅ Class label map (based on your 13-class PlantVillage model)
label_map = {
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
}

app = Flask(__name__)

# 🔍 Load .tflite model
interpreter = tf.lite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# ⚙️ Image Preprocessing
def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))  # Must match model input shape
    img_array = np.array(image, dtype=np.float32)
    img_array = img_array / 255.0  # Normalize
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# 🔍 Prediction Endpoint
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    image_bytes = image_file.read()
    input_data = preprocess_image(image_bytes)

    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])

    predicted_index = int(np.argmax(output_data))
    confidence = float(np.max(output_data))
    class_name = label_map.get(predicted_index, "Unknown")

    return jsonify({
        "class_id": predicted_index,
        "class_name": class_name,
        "confidence": round(confidence * 100, 2)
    })

# 🚀 Start Flask Server


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
