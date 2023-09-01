import * as tf from "@tensorflow/tfjs";
import { loadGraphModel } from "@tensorflow/tfjs-converter";

let isDetecting = false
let customModelURL = chrome.runtime.getURL('best_web_model.json')

chrome.runtime.onMessage.addListener(async (message: any, sender, sendResponse) => {
    if (message.type === 'startDetecting') {
      isDetecting = true;
      await loadModel();
      if (customModelURL) {
        detection();
      }
    }
    else if (message.type === 'stopDetecting') {
        isDetecting = false;
        const videoElements = findVideo();
		for (const video of videoElements) {
			const canvas = video.parentElement.querySelector('canvas');
			if (canvas){
				clearCanvas(canvas);
			}
      }
  }});

  const clearCanvas = (canvas: HTMLCanvasElement) => {
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
};

