import * as tf from "@tensorflow/tfjs";
import { loadGraphModel } from "@tensorflow/tfjs-converter";

let isDetecting = false
let customModelURL = chrome.runtime.getURL('yolov8n_web_model.json')
let model: tf.GraphModel | null = null;

chrome.runtime.onMessage.addListener(async (message: any, sender, sendResponse) => {
    if (message.type === 'startDetecting') {
      isDetecting = true;
      const loadedModel = await loadModel();
      if (loadedModel) {

        // console.log("Model input shape:", loadedModel.inputs[0].shape);
        // console.log("Model output shape:", loadedModel.outputs);
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

const detection = async () => {

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

        // console.log(meetVideo.videoWidth, meetVideo.videoHeight)

        // Run the preprocessed frame through the model
        const predictions = model.predict(preprocessedImage) as tf.Tensor;
        // predictions.print();
        // console.log("results: ", predictions);

        if (!predictions) {
            console.error("Predictions are undefined.");
            return;
        }

        // const boxes = await predictions.array();

        // console.log("boxes: ",boxes)
        

        // let detection = boxes[0][0]
        // let x = detection[0];
        // let y = detection[1];
        // let width = detection[2];
        // let height = detection[3];
        // let confidenceScore = detection[4];

        // // Print or use these values as needed
        // console.log("x-coordinate: " + x);
        // console.log("y-coordinate: " + y);
        // console.log("width: " + width);
        // console.log("height: " + height);
        // console.log("confidence score: " + confidenceScore);

        const scalingFactorX = meetVideo.videoWidth / 640;
        const scalingFactorY = meetVideo.videoHeight / 640; 
        const boxes : any = await predictions.array();

        if (!Array.isArray(boxes) || boxes.length === 0) {
            console.error("No boxes found in predictions.");
            return;
        }

        const confidenceThreshold = 50;
        for (const detection of boxes[0]) {
            const [x, y, width, height, confidence] = detection;

            if (confidence > confidenceThreshold) {
                // Map the values to the original video dimensions
                const mappedX = x * scalingFactorX;
                const mappedY = y * scalingFactorY;
                const mappedWidth = width * scalingFactorX;
                const mappedHeight = height * scalingFactorY;

                drawBox(meetVideo, mappedX, mappedY, mappedWidth, mappedHeight);
            }
          }
    
        // // Cleaning up tensors
        // tfImage.dispose();
        // resizedImage.dispose();
        // batchedImage.dispose();
        // preprocessedImage.dispose();

        // Schedule the next frame processing
        requestAnimationFrame(detection);
    };
}

const drawBox = (videoElement: HTMLVideoElement, x: number, y: number, width: number, height: number) => {
    // Get or create the overlay canvas

    console.log(x,y,width,height)
    
    const canvas = document.createElement("canvas");
      canvas.width = videoElement.clientWidth;
      canvas.height = videoElement.clientHeight;
      canvas.style.position = 'absolute';
      canvas.style.top = `${videoElement.offsetTop}px`;
      canvas.style.left = `${videoElement.offsetLeft}px`;
      videoElement.parentElement.appendChild(canvas);

  
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "red"; // Color of the bounding box
    ctx.lineWidth = 2; // Width of the box border
    ctx.strokeRect(x, y, width, height);
  
    ctx.font = "14px Arial";
    ctx.fillStyle = "#FF0000";
    // ctx.fillText(`Confidence: ${confidence.toFixed(2)}`, x, y - 5);
  };