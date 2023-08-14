import * as tf from "@tensorflow/tfjs";
import { loadGraphModel } from "@tensorflow/tfjs-converter";

// let isDetecting = false;
let customModelURL = chrome.runtime.getURL('best_web_model.json')
let model = null;

chrome.runtime.onMessage.addListener(async (message: any, sender, sendResponse) => {
	if (message.type === 'startDetecting') {
	//   isDetecting = true;
	  await loadCustomModel();
    if (model) {
      detectObjectOnMeet();
    }
	}
  });

const findVideoElements = () => {
  const meetView = document.getElementsByClassName("p2hjYe TPpRNe");
  const videoElements : HTMLVideoElement [] = [];

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
    if (tf.ready()){
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
        try{
          const results = await model.predict(tensor);
          const resultsArray = await results.array();
          console.log(resultsArray);  // Let's log to inspect the output structure

          if (!resultsArray || resultsArray.length < 3) {
            console.error('Unexpected results array structure:', resultsArray);
            return;
          }

          const boxes = resultsArray[0];
          const scores = resultsArray[1][0] || [];  // Provide a default value if index doesn't exist
          const classes = resultsArray[2][0] || [];

          if (boxes.length !== scores.length || boxes.length !== classes.length) {
            console.error('Mismatched dimensions between boxes, scores, and classes.');
            return;
          }

          // Create a results array to match what visualizeResults expects
          const detections = boxes.map((box, index) => {
            return {
              y1: box[0],
              x1: box[1],
              y2: box[2],
              x2: box[3],
              confidence: scores[index],
              label: classes[index] === 1 ? 'person' : 'other'
            };
          });

          visualizeResults(video, detections);

        } catch (error) {
          console.error('error in detection:', error);
        }
        tensor.dispose();
    }
  }
  setTimeout(detectObjectOnMeet, 1000);
}

const visualizeResults = (video: HTMLVideoElement, detections: any[]) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = video.clientWidth;
  canvas.height = video.clientHeight;
  canvas.style.position = 'absolute';
  canvas.style.top = `${video.offsetTop}px`;
  canvas.style.left = `${video.offsetLeft}px`;
  canvas.style.pointerEvents = 'none';

  video.parentElement?.appendChild(canvas);

  for (const detection of detections) {
    const { x1, y1, x2, y2, confidence, label } = detection;

    if (confidence > 0.5) { // You can adjust this threshold as required
      ctx!.strokeStyle = label === 'person' ? 'red' : 'blue';
      ctx!.lineWidth = 2;
      ctx!.strokeRect(x1, y1, x2 - x1, y2 - y1);  // Adjusting for the actual width and height of the box

      if (label === 'person') {
        console.log('Detected a person with confidence:', confidence);
      } else {
        console.log('Detected others with confidence:', confidence);
      }
    }
  }
}