import * as tf from "@tensorflow/tfjs";
import { loadGraphModel } from "@tensorflow/tfjs-converter";

let isDetecting = false
let customModelURL = chrome.runtime.getURL('best_web_model.json')
let model: tf.GraphModel | null = null;

chrome.runtime.onMessage.addListener(async (message: any, sender, sendResponse) => {
    if (message.type === 'startDetecting') {
      isDetecting = true;
      const loadedModel = await loadModel();
      if (loadedModel) {

        console.log("Model input shape:", loadedModel.inputs[0].shape);
        console.log("Model output shape:", loadedModel.outputs);

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
        model = await loadGraphModel(customModelURL)
        console.log("Model loaded successfully");
        return model; 
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

    if (!model){
        console.error("Model is not loaded yet.");
        return;
    }

    const meetVideos = findVideo();
    if (!isDetecting) return;

    for (const meetVideo of meetVideos) {
        // const canvas = document.createElement("canvas");
        // canvas.width = meetVideo.videoWidth;
        // canvas.height = meetVideo.height;
        // const ctx = canvas.getContext("2d");
        // // ctx.drawImage(meetVideo[0],0,0,meetVideo[0].videoWidth,meetVideo[0].videoHeight);
        // ctx.drawImage(meetVideo, 0, 0, 640, 640);

        const tfImage = tf.browser.fromPixels(meetVideo);
        const resizedImage = tf.image.resizeBilinear(tfImage, [640, 640]); // assuming the model expects [224, 224, 3] input shape
        const batchedImage = resizedImage.expandDims(0);
        const preprocessedImage = batchedImage.toFloat().div(tf.scalar(255)); // normalizing

        // Run the preprocessed frame through the model
        const predictions = model.predict(preprocessedImage) as tf.Tensor;
        predictions.print();
        console.log("results: ", predictions);
    
        // Cleaning up tensors
        tfImage.dispose();
        resizedImage.dispose();
        batchedImage.dispose();
        preprocessedImage.dispose();

        // Schedule the next frame processing
        requestAnimationFrame(detection);
    };
}