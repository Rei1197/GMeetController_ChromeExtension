import * as tf from "@tensorflow/tfjs";

let isDetecting = false;
let customModel: tf.LayersModel | null = null;


const loadCustomModel = async () => {
  try {
    customModel = await tf.loadLayersModel('src/assests/best_web_model/model.json'); 
    console.log('Model loaded successfully.');
    return true;
  } catch (error) {
    console.error('Failed to load the model:', error);
    return false;
  }
};
chrome.runtime.onMessage.addListener(async (message: any, sender, sendResponse) => {
	if (message.type === 'startDetection') {
	  isDetecting = true;
	  const modelLoaded = await loadCustomModel();
	  
	  if (modelLoaded) {
		sendResponseSafe(sendResponse, { status: "success", message: "Model loaded successfully." });
	  } else {
		sendResponseSafe(sendResponse, { status: "error", message: "Failed to load the model." });
	  }
	  
	  return true;  
	} else if (message.type === 'stopDetection') {
	  isDetecting = false;
	  customModel?.dispose(); 
	  customModel = null;
	  console.log('Stopped detecting and model disposed.');
	  sendResponseSafe(sendResponse, { status: "success", message: "Detection stopped." });
	  return true;  
	}
  });
  
  // Safely attempt to send a response
  const sendResponseSafe = (sendResponse, response) => {
	try {
	  sendResponse(response);
	} catch (error) {
	  console.error('Failed to send response:', error);
	}
  };
  
  // Just to handle the synchronous response requirement of Chrome
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "getStatus") {
	  sendResponse({ isDetecting: isDetecting });
	}
	return true; // Indicates that the response will be sent asynchronously
  });
  