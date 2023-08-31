import * as tf from "@tensorflow/tfjs";
import { loadGraphModel } from "@tensorflow/tfjs-converter";


let isDetecting = false;
let customModelURL = chrome.runtime.getURL('best_web_model.json')
let model = null;

chrome.runtime.onMessage.addListener(async (message: any) => {
	if (message.type === 'startDetecting') {
		isDetecting = true;
		await logMeetVideoStream();
	} else if (message.type === 'stopDetecting') {
		isDetecting = false;
		const videoElements = findVideoElements();
		for (const video of videoElements) {
			const canvas = video.parentElement.querySelector('canvas');
			if (canvas){
				clearCanvas(canvas);
			}
		// if (overlayCanvas) {
		// 	clearCanvas(overlayCanvas);
		// }
	}
}});

const updateOffscreenCanvasDimensions = (div, OffscreenCanvas) => {
	const width = div.clientWidth;
	const height = div.clientHeight;
  
	OffscreenCanvas.width = width;
	OffscreenCanvas.height = height;
  };

const captureVideoFrame = async (videoElement: HTMLVideoElement) => {
	// console.log(videoElement.videoWidth, videoElement.videoHeight)
	const div = videoElement.closest('.p2hjYe.TPpRNe');
	const offscreenCanvas = new OffscreenCanvas(videoElement.videoWidth, videoElement.videoHeight);
	updateOffscreenCanvasDimensions(div, offscreenCanvas);

	const ctx = offscreenCanvas.getContext("2d");

	
	// ctx.scale(-1, 1);
	// ctx.translate(-offscreenCanvas.width, 0);

	ctx.drawImage(videoElement, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
	return ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
};

const findVideoElements = () => {
	const containerElements = document.getElementsByClassName("p2hjYe TPpRNe"); //the class name for the original screen canvas.
	//p2hjYe TPpRNe (only the user itself) || Gv1mTb-aTv5jf Gv1mTb-PVLJEc (changed into this after joining the meeting)|| axUSnc  P9KVBf
	const videoElements: HTMLVideoElement[] = [];

	for (const container of Array.from(containerElements)) {
		const videos = container.getElementsByTagName("video");
		if (videos.length > 0) {
			videoElements.push(videos[0]);
		}
	}
	return videoElements;
};

function nonMaxSuppression(boxes, scores, threshold) {
  const selectedBoxes = [];

  while (scores.length) {
    const maxScoreIndex = scores.indexOf(Math.max(...scores));

    const currentBox = boxes[maxScoreIndex];
    selectedBoxes.push(currentBox);

    boxes.splice(maxScoreIndex, 1);
    scores.splice(maxScoreIndex, 1);

    const ious = boxes.map(box => intersectionOverUnion(currentBox, box));

    for (let i = ious.length - 1; i >= 0; i--) {
      if (ious[i] > threshold) {
        boxes.splice(i, 1);
        scores.splice(i, 1);
      }
    }
  }

  return selectedBoxes;
}

function intersectionOverUnion(boxA, boxB) {
  const xA = Math.max(boxA[0], boxB[0]);
  const yA = Math.max(boxA[1], boxB[1]);
  const xB = Math.min(boxA[2], boxB[2]);
  const yB = Math.min(boxA[3], boxB[3]);

  const interArea = Math.max(0, xB - xA + 1) * Math.max(0, yB - yA + 1);

  const boxAArea = (boxA[2] - boxA[0] + 1) * (boxA[3] - boxA[1] + 1);
  const boxBArea = (boxB[2] - boxB[0] + 1) * (boxB[3] - boxB[1] + 1);

  const iou = interArea / (boxAArea + boxBArea - interArea);

  return iou;
}

const processFrame = async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
  if (!isDetecting) return;

  if (video.videoWidth === 0 || video.videoHeight === 0) {
    requestAnimationFrame(() => processFrame(video, canvas));
    return;
  }
  canvas.width = video.clientWidth;
  canvas.height = video.clientHeight;
  canvas.style.left = video.offsetLeft + "px";
  canvas.style.top = video.offsetTop + "px";

  const frameData = await captureVideoFrame(video);
  const predictions = await model.detect(frameData);

  const boxes = predictions.map(prediction => prediction.bbox);
  const scores = predictions.map(prediction => prediction.score);

  // Perform non-max suppression
  const selectedBoxes = nonMaxSuppression(boxes, scores, 0.999999999999996);

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const box of selectedBoxes) {
    const index = boxes.indexOf(box as any);
  const prediction = predictions[index];
  const [x, y, width, height] = box;
  ctx.strokeStyle = "#FF0000";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  ctx.font = "14px Arial";
  ctx.fillStyle = "#FF0000";
  ctx.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, x, y - 5);
}
  requestAnimationFrame(() => processFrame(video, canvas));
};

const detectObjectOnMeet = async () => {
  const videos = findVideoElements();
  for (const video of videos) {
    if (!video.paused && !video.ended) {
      let tensor = tf.browser.fromPixels(video);
      const resizedImage = tf.image.resizeBilinear(tensor, [640, 640]);
      const normalizedImage = resizedImage.div(255);
      const inputTensor = normalizedImage.expandDims(0);

      const results = model.predict(inputTensor);
      console.log("results   shape", results.shape);
      const reshapedResults = results.reshape([8400, 5]);
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
  requestAnimationFrame(detectObjectOnMeet);
};


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
    if (prob > 0.999999999999) {
      ctx!.strokeStyle = 'red';
      ctx!.lineWidth = 1;
      ctx!.strokeRect(x1, y1, x2 - x1, y2 - y1);
      console.log('Detected a person with confidence:', prob);
    }
  }
}

const logMeetVideoStream = async () => {
  const videos = findVideoElements();
  console.log(`Number of video elements: ${videos.length}`);

  if (videos.length === 0) {
    console.error('No video elements found on the page.');
    return;
  }

  console.log('Loading custom model...');
  const isModelLoaded = await loadCustomModel();
  if (!isModelLoaded) {
    console.error('Failed to load the custom model.');
    return;
  }

  console.log('Custom model loaded successfully.');

  for (const video of videos) {
    const canvas = document.createElement("canvas");
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "1000";
    video.parentElement.appendChild(canvas);
    const parentElement = video.parentElement;
    parentElement.style.position = 'relative';
    parentElement.appendChild(canvas);

    detectObjectOnMeet();
  }
};

const clearCanvas = (canvas: HTMLCanvasElement) => {
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
};

