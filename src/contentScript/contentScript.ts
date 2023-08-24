import * as tf from "@tensorflow/tfjs";
import { loadGraphModel } from "@tensorflow/tfjs-converter";

let isDetecting = false;
let customModelURL = chrome.runtime.getURL('yolov8n_web_model.json')
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

const decodeYOLOOutput = (outputArray: any[]) => {
  const gridSize = 13;  // Adjust if different.
  const numAnchors = 5;  // Adjust if different.
  // const valuesPerAnchor = 5;
  let decodedOutput = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      for (let anchor = 0; anchor < numAnchors; anchor++) {
        let j = y * gridSize * numAnchors + x * numAnchors + anchor;
        let tx = outputArray[0][0][j];
        let ty = outputArray[0][1][j];
        let tw = outputArray[0][2][j];
        let th = outputArray[0][3][j];
        let confidence = outputArray[0][4][j];

        let bx = (sigmoid(tx) + x)
        let by = (sigmoid(ty) + y) 
        let bw = Math.exp(tw)  // This may need adjustment based on anchor box sizes
        let bh = Math.exp(th)
        confidence = sigmoid(confidence);

        console.log("confidence:",confidence)

        decodedOutput.push({
          x: bx,
          y: by,
          width: bw,
          height: bh,
          confidence: confidence,
          label: 'person'  // Only one class, so it's always 'person' in your case
        });
      }
    }
  }
  return decodedOutput;
}

const sigmoid = (x: number) => {
  return 1 / (1 + Math.exp(-x));
}

const detectObjectOnMeet = async () => {
  const videos = findVideoElements();
  for (const video of videos) {
    if (!video.paused && !video.ended) {
      let tensor = tf.browser.fromPixels(video);
      tensor = tensor.resizeBilinear([640, 640]);
      tensor = tensor.expandDims(0);
      const results = await model.predict(tensor);
      //   console.log(results)
      //  console.log(results.shape)
      // let box = results.boxes
      // console.log(box.length)
      const resultsArray = await results.array();
      // const boxes = resultsArray[0];
      // const scores = resultsArray[0][2][0] || [];  // Provide a default value if index doesn't exist
      // const classes = resultsArray[0][1][0] || [];

      // console.log('boxes:', boxes)
      // console.log('score:', scores)
      // console.log('classes:', classes)

      // Decode the YOLO output
      const decodedBoxes = decodeYOLOOutput(resultsArray);

      // Log and visualize bounding boxes
      visualizeResults(video, decodedBoxes);

      // Clean up tensor to prevent GPU memory leak
      tensor.dispose();
    }
  }
  setTimeout(detectObjectOnMeet, 1000);
}

const visualizeResults = (video: HTMLVideoElement, resultsArray: any[]) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = video.clientWidth;
  canvas.height = video.clientHeight;
  canvas.style.position = 'absolute';
  canvas.style.top = `${video.offsetTop}px`;
  canvas.style.left = `${video.offsetLeft}px`;
  canvas.style.pointerEvents = 'none';

  video.parentElement?.appendChild(canvas);

  for (const result of resultsArray) {
    const { x, y, width, height, confidence, label } = result;

    // Adjust for video's actual size
    const adjustedWidth = (width / 640) * canvas.width;
    const adjustedHeight = (height / 640) * canvas.height;
    const topLeftX = (x - width / 2) * canvas.width;  // Convert center to top-left corner
    const topLeftY = (y - height / 2) * canvas.height;

    if (confidence > 0.4) {
      ctx!.strokeStyle = label === 'person' ? 'red' : 'blue';
      ctx!.lineWidth = 1;
      ctx!.strokeRect(topLeftX, topLeftY, width * canvas.width, height * canvas.height);

      if (label === 'person') {
        console.log('Detected a person with confidence:', confidence);
      } else {
        console.log('Detected others with confidence:', confidence);
      }
    }
  }
}