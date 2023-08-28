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

const sigmoid = (x) => {
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

      const results = await model.predict(inputTensor);
      const reshapedResults = results.reshape([8400, 5]);
      const resultsArray = await reshapedResults.array();
      const boxes = await process_output(resultsArray, video.videoWidth, video.videoHeight);

      visualizeResults(video, boxes);

      tensor.dispose();
    }
  }
  setTimeout(detectObjectOnMeet, 1000);
}

async function process_output(output: any[], img_width: number, img_height: number) {
  const boxes = [];
  const scores = [];
  for (let index = 0; index < output.length; index++) {
      const result = output[index];
      const portion = result.slice(0, 4);
      const prob = sigmoid(Math.max(...result.slice(4)));
      if (prob < 0.5) {
          continue;
      }
      const xc = portion[0];
      const yc = portion[1];
      const w = portion[2];
      const h = portion[3];
      const x1 = (xc - w / 2) / 640 * img_width;
      const y1 = (yc - h / 2) / 640 * img_height;
      const x2 = (xc + w / 2) / 640 * img_width;
      const y2 = (yc + h / 2) / 640 * img_height;
      boxes.push([y1, x1, y2, x2]); // note the order of the coordinates
      scores.push(prob);
  }

  const maxOutputSize = 20;
  const iouThreshold = 0.5;
  const scoreThreshold = 0.5;
  const nms_indices = await tf.image.nonMaxSuppressionAsync(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold);

  const nms_indices_array = await nms_indices.array();
  const finalBoxes = nms_indices_array.map(index => {
      const [y1, x1, y2, x2] = boxes[index];
      return [x1, y1, x2, y2, 'person', scores[index]];
  });

  return finalBoxes;
}



function iou(box1,box2) {
    return intersection(box1,box2)/union(box1,box2);
}

function union(box1,box2) {
    const [box1_x1,box1_y1,box1_x2,box1_y2] = box1;
    const [box2_x1,box2_y1,box2_x2,box2_y2] = box2;
    const box1_area = (box1_x2-box1_x1)*(box1_y2-box1_y1)
    const box2_area = (box2_x2-box2_x1)*(box2_y2-box2_y1)
    return box1_area + box2_area - intersection(box1,box2)
}

function intersection(box1,box2) {
    const [box1_x1,box1_y1,box1_x2,box1_y2] = box1;
    const [box2_x1,box2_y1,box2_x2,box2_y2] = box2;
    const x1 = Math.max(box1_x1,box2_x1);
    const y1 = Math.max(box1_y1,box2_y1);
    const x2 = Math.min(box1_x2,box2_x2);
    const y2 = Math.min(box1_y2,box2_y2);
    return (x2-x1)*(y2-y1)
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
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 3;
    ctx.strokeRect(x1, y1, x2-x1, y2-y1);
    ctx.fillStyle = "#00ff00";
    const width = ctx.measureText(label).width;
    ctx.fillRect(x1, y1, width+10, 25);
    ctx.fillStyle = "#000000";
    ctx.fillText(label, x1, y1+18);
  }
}
