import * as tf from "@tensorflow/tfjs";

// let isDetecting = false;
let customModel: tf.LayersModel | null = null;

chrome.runtime.onMessage.addListener(async (message: any, sender, sendResponse) => {
	if (message.type === 'startDetecting') {
	//   isDetecting = true;
	  await loadCustomModel();
	//   if (customModel) {
	// 	alert("Model is loaded!");
	//   } else {
	// 	alert("Model is not loaded yet.");
	//   }
	}
  });
	  


const loadCustomModel = async () => {
  try {
    customModel = await tf.loadLayersModel(chrome.runtime.getURL('model.json')); 
    console.log('Model loaded successfully.');
    return true;
  } catch (error) {
    console.error('Failed to load the model:', error);
    return false;
  }
};

