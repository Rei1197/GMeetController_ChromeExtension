import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import '@tensorflow/tfjs-backend-cpu';

let isDetecting = false;

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

	// Apply a horizontal flip transformation
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

const processFrame =async (video:HTMLVideoElement, canvas: HTMLCanvasElement, model: cocoSsd.ObjectDetection) => {
	if (!isDetecting) return;

	if (video.videoWidth === 0 || video.videoHeight === 0) {
		requestAnimationFrame(() => processFrame(video, canvas, model));
		return;
	  }
	
	// Update canvas size and position to match the video
	canvas.width = video.clientWidth;
	canvas.height = video.clientHeight;
	canvas.style.left = video.offsetLeft + "px";
	canvas.style.top = video.offsetTop + "px";

	const frameData = await captureVideoFrame(video);
	const predictions = await model.detect(frameData);

	const formattedPredictions = predictions.map(({ class: detectedClass, score }) => ({
		detectedClass,
		score,
	  }));
	
	  formattedPredictions.forEach(predictions => {
		console.log("Predictions:", predictions.detectedClass);
	  });
	 

	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// ctx.putImageData(frameData, 0, 0);

	for (const prediction of predictions) {
		ctx.strokeStyle = "#FF0000";
		ctx.lineWidth = 2;
		ctx.strokeRect(...prediction.bbox);
		ctx.font = "14px Arial";
		ctx.fillStyle = "#FF0000";
		ctx.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, prediction.bbox[0], prediction.bbox[1] - 5);
	}
	requestAnimationFrame(() => processFrame(video, canvas, model));
};

const logMeetVideoStream = async () => {
	const videos = findVideoElements();
	console.log(`Number of video elements: ${videos.length}`);

	if (videos.length === 0) {
		console.error('No video elements found on the page.');
		return;
	}

	console.log('Loading model...');
	await tf.ready();
	const model = await cocoSsd.load();
	console.log('Model loaded successfully.');

	for (const video of videos){
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
	
		processFrame(video, canvas, model);
	}

};

const clearCanvas = (canvas: HTMLCanvasElement) => {
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// let overlayCanvas: HTMLCanvasElement;