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
const sigmoid = (x: number) => {
  return 1 / (1 + Math.exp(-x));
}

const detectObjectOnMeet = async () => {
  const videos = findVideoElements();
  for (const video of videos) {
    if (!video.paused && !video.ended) {
      let tensor = tf.browser.fromPixels(video);
      const resizedImage = tf.image.resizeBilinear(tensor,[640, 640]);
      const normalizedImage = resizedImage.div(255);
      const inputTensor = normalizedImage.expandDims(0);
      // tensor = tensor.resizeBilinear([640, 640]);
      // tensor = tensor.expandDims(0);
     
      const results = await model.predict(inputTensor);
      console.log("results shape",results.shape);
      const reshapedResults = results.reshape([8400, 5]);
      // console.log('Reshaped Results Shape:', reshapedResults.shape);
      const resultsArray = await reshapedResults.array();
      const result = resultsArray[0];
      const portion = result.slice(0, 4); 
      const prob = sigmoid(Math.max(...result.slice(4)));
      if (prob > 0.5) {
        const box = checkNum(portion, prob, video.videoWidth, video.videoHeight);
        visualizeResults(video, [box]);
      }

      tensor.dispose();
    }
  }
  setTimeout(detectObjectOnMeet, 1000);
}



const checkNum = (arr: any, prob, videoWidth, videoHeight) => {

  console.log("sliced array",arr);
  console.log("probability", prob)

  let xc = arr[0]
  let yc = arr[1]
  let w = arr[2]
  let h = arr[3]
  

  const x1 = (xc-w/2)
  const y1 = (yc-h/2)
  const x2 = (xc+w/2)
  const y2 = (yc+h/2)
  const label = 'person';

  // console.log(x1,y1,x2,y2)
  return [x1, y1, x2, y2, label, prob];
}

const visualizeResults = (video: HTMLVideoElement, boxes: any[]) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = video.clientWidth;
  canvas.height = video.clientHeight;
  canvas.style.position = 'absolute';
  canvas.style.top = `${video.offsetTop}px`;
  canvas.style.left = `${video.offsetLeft}px`;
  canvas.style.pointerEvents = 'none';

  video.parentElement?.appendChild(canvas);

  for (const box of boxes) {
    const [x1, y1, x2, y2, label, prob] = box;
    if (prob > 0.5) {
      ctx!.strokeStyle = 'red';
      ctx!.lineWidth = 1;
      ctx!.strokeRect(x1, y1, x2 - x1, y2 - y1);
      console.log('Detected a person with confidence:', prob);
    }
  }
}