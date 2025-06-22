import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

// Load the model once
let model;

export const loadModel = async () => {
  if (!model) {
    model = await mobilenet.load();
  }
};

export const predictImage = async (imageElement) => {
  await loadModel();
  const predictions = await model.classify(imageElement);
  return predictions;
};
