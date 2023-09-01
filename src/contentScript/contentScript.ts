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

const findVideo = () => {
    const videoClass = document.getElementsByClassName("p2hjYe TPpRNe");
    const video: HTMLVideoElement[] = [];

    for (const container of Array.from(videoClass)){
        const videos = container.getElementsByTagName("video");
        if (videos.length > 0) {
            video.push(videos[0]);
        }
    }

    // //------------
    // // for multiple videos
    // for (const videoElement of videos) {
    //     video.push(videoElement);
    // }
    // //------------
    
    return video;
}

const loadModel = async () => {

    // find the video on google meet
    const meetVideo = findVideo();
    console.log(`Number of video elements: ${meetVideo.length}`);
    if (meetVideo.length == 0) {
        console.error("No video elements found on the page.");
        return;
    }

    // loading the custom model
    console.log('loading model...');
    try {
        await tf.setBackend('webgl');
    if (tf.ready()){
        const model = await loadGraphModel(customModelURL)
        console.log("Model loaded successfully");
    } else {
        console.error ('TensorFlow.js backend is not ready.');
        return;
    }
    } catch (error) {
        console.error("Failed to load the model: ", error);
        return;
    }
};

const detection = () => {

    console.log("you have reached to detection function");
}