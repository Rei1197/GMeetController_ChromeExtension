import * as tf from "@tensorflow/tfjs";
import { loadGraphModel } from "@tensorflow/tfjs-converter";

let isDetecting = false;
let customModelURL = chrome.runtime.getURL('best_web_model.json')
let model = null;

chrome.runtime.onMessage.addListener(async (message: any, sender, sendResponse) => {
  if (message.type === 'startDetecting') {
        isDetecting = true;
    await loadCustomModel();
    if (model) {
      detectObjectOnMeet();
    }
  }
});


const findVideoElements = () => {
  const meetView = document.getElementsByClassName("p2hjYe TPpRNe");
  const videoElements: HTMLVideoElement[] = [];
  for (const container of Array.from(meetView)) {
    const videos = container.getElementsByTagName("video");
    if (videos.length > 0) {
      videoElements.push(videos[0]);
    }
  }
  return videoElements;
}


const loadCustomModel = async () => {
  const videos = findVideoElements();
  console.log(`Number of video elements: ${videos.length}`);
  try {
    // customModel = await tf.loadLayersModel(chrome.runtime.getURL('model.json')); 
    await tf.setBackend('webgl');
    if (tf.ready()) {
      model = await loadGraphModel(customModelURL)
      console.log('Model loaded successfully.');
      return true;
    } else {
      console.error('TensorFlow.js backend is not ready.');
      return false;
    }

  } catch (error) {
    console.error('Failed to load the model:', error);
    return false;
  }
};

const detectObjectOnMeet = async () => {
  const videos = findVideoElements();
  for (const video of videos) {
    if (!video.paused && !video.ended) {
        let tensor = tf.browser.fromPixels(video);
        tensor = tensor.resizeBilinear([640, 640]);
        tensor = tensor.expandDims(0);
        const results = await model.predict(tensor);
        const resultsArray = await results.array();
        console.log(resultsArray)

        const boxes = resultsArray[0][0][0];
        // const scores = resultsArray[1][0] || [];  // Provide a default value if index doesn't exist
        // const classes = resultsArray[2][0] || [];

        //console.log(boxes)
        // console.log(scores)
        // console.log(classes)
        
        // Log and visualize bounding boxes
        // visualizeResults(video, resultsArray);

        // Clean up tensor to prevent GPU memory leak
        tensor.dispose();
    }
  }
  setTimeout(detectObjectOnMeet, 1000);
}

// const visualizeResults = (video: HTMLVideoElement, resultsArray: any[]) => {
//   const canvas = document.createElement('canvas');
//   const ctx = canvas.getContext('2d');

//   canvas.width = video.clientWidth;
//   canvas.height = video.clientHeight;
//   canvas.style.position = 'absolute';
//   canvas.style.top = `${video.offsetTop}px`;
//   canvas.style.left = `${video.offsetLeft}px`;
//   canvas.style.pointerEvents = 'none';

//   video.parentElement?.appendChild(canvas);

//   for (const result of resultsArray) {
//     const { x, y, width, height, confidence, label } = result; // Modify based on your model's output structure
    
//     if (confidence > 0.9) {
//       ctx!.strokeStyle = label === 'person' ? 'red' : 'blue';
//       ctx!.lineWidth = 2;
//       ctx!.strokeRect(x, y, width, height);

//       if (label === 'person') {
//         console.log('Detected a person with confidence:', confidence);
//       } else {
//         console.log('Detected others with confidence:', confidence);
//       }
//     }
//   }
// }
