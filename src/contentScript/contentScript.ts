window.onload= () => {
	console.log("I am from content Script.");
}

import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

let isDetecting = false;

chrome.runtime.onMessage.addListener(async (message: any) => {
	if (message.type === 'startDetecting') {
		isDetecting = true;
	  	logMeetVideoStream();
	} else if (message.type === 'stopDetecting') {
		isDetecting = false;
		if (overlayCanvas) {
			clearCanvas(overlayCanvas);
		  }
	}
  });
  
  const captureVideoFrame = async (videoElement: HTMLVideoElement) => {
	const offscreenCanvas = new OffscreenCanvas(videoElement.videoWidth, videoElement.videoHeight);
	const ctx = offscreenCanvas.getContext("2d");
	ctx.drawImage(videoElement, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
	return ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  };


  const findVideoElements = () => {
	const containerElements = document.getElementsByClassName("p2hjYe TPpRNe");
	//ADivge Gt2yUd NbyP5 || Gv1mTb-aTv5jf || p2hjYe TPpRNe || Gv1mTb-aTv5jf Gv1mTb-PVLJEc
	const videoElements: HTMLVideoElement[] = [];
  
	for (const container of Array.from(containerElements)) {
	  const videos = container.getElementsByTagName("video");
	  if (videos.length > 0) {
		videoElements.push(videos[0]);
	  }
	}
	return videoElements;
  };

  
  const logMeetVideoStream = async () => {
	const videos = findVideoElements();
	console.log(`Number of video elements: ${videos.length}`);
  
	if (videos.length === 0) {
	  console.error('No video elements found on the page.');
	  return;
	}
  
	const video = videos[0];

	const createCanvasOverlay = (videoElement: HTMLVideoElement) => {
		const canvas = document.createElement('canvas');
		canvas.width = video.clientWidth;
		canvas.height = video.clientHeight;
		canvas.style.position = "absolute";
		canvas.style.top = "0";
		canvas.style.left = "0";
		// canvas.style.zIndex = '999';
	
		const parentElement = videoElement.parentElement;
		parentElement.style.position = 'relative';
		parentElement.appendChild(canvas);
	
		return canvas;
	  };

	const canvas = createCanvasOverlay(video);
  
	console.log('Loading model...');
	await tf.ready();
	const model = await cocoSsd.load();
	console.log('Model loaded successfully.');


	const drawBoundingBoxes = (canvas: HTMLCanvasElement, predictions: cocoSsd.DetectedObject[]) => {
	  const ctx = canvas.getContext('2d');
	  ctx.clearRect(0, 0, canvas.width, canvas.height);
	  ctx.lineWidth = 2;
  
	  predictions.forEach(({ bbox, class: detectedClass }) => {
		const [x, y, width, height] = bbox;
		ctx.strokeStyle = 'red';
		ctx.strokeRect(x, y, width, height);
		ctx.font = '14px Arial';
		ctx.fillStyle = 'red';
		ctx.fillText(detectedClass, x, y - 4);
	  });
	};
  
	// const captureVideoFrameAndDrawBoundingBoxes = async (
	//   videoElement: HTMLVideoElement,
	//   predictions: cocoSsd.DetectedObject[]
	// ) => {
	//   const offscreenCanvas = new OffscreenCanvas(videoElement.videoWidth, videoElement.videoHeight);
	//   const ctx = offscreenCanvas.getContext("2d");
	//   ctx.drawImage(videoElement, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
  
	//   drawBoundingBoxes(offscreenCanvas, predictions);
  
	//   return offscreenCanvas;
	// };
  
	const processFrame = async () => {
		if(!isDetecting){
			return
		}
	//   if (video.readyState === video.HAVE_ENOUGH_DATA) {
		// console.log("Processing frame...");
  
		// console.log("Detecting objects in frame...");
		const frameData = await captureVideoFrame(video);
		const predictions = await model.detect(frameData);
  
		const formattedPredictions = predictions.map(({ class: detectedClass, score }) => ({
		  detectedClass,
		  score,
		}));
		console.log("Predictions:", formattedPredictions);
		drawBoundingBoxes(canvas, predictions);
  
		// // Draw bounding boxes on the canvas
		// const offscreenCanvasWithBoundingBoxes = await captureVideoFrameAndDrawBoundingBoxes(
		//   video,
		//   predictions
		// );
	//   }
  
	  requestAnimationFrame(processFrame);
	};
  
	processFrame();
  };
  
  const clearCanvas = (canvas: HTMLCanvasElement) => {
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  let overlayCanvas: HTMLCanvasElement;

//   const logGoogleMeetVideoFrames = () => {
// 	console.log("logGoogleMeetVideoFrames called");
  
// 	const captureVideoFrame = async (video: HTMLVideoElement): Promise<Blob | null> => {
// 		const canvas = document.createElement("canvas");
// 		canvas.width = video.videoWidth;
// 		canvas.height = video.videoHeight;
// 		const ctx = canvas.getContext("2d");
// 		ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);
// 		return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg"));
// 	  };
	  
	
  
// 	const videos = findVideoElements();
// 	console.log("Number of video elements:", videos.length);
  
// 	for (const video of videos) {
// 	  processVideoElement(video);
// 	}
//   };

//   chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
// 	console.log('Message received in content script:', message);
// 	if (message.type === "logMeetVideoStream") {
// 	  logGoogleMeetVideoFrames();
// 	}
//   });
  


// const logMeetVideoStream = async (tabId: number) => {
// 	try {
// 	  const constraints: chrome.tabCapture.CaptureOptions = {
// 		audio: false,
// 		video: true,
// 		videoConstraints: {
// 		  mandatory: {
// 			minWidth: 1280,
// 			minHeight: 720,
// 			minFrameRate: 30,
// 		  },
// 		},
// 	  };
  
  
// 	  if (tabId) {
// 		chrome.tabCapture.capture(constraints, (stream: MediaStream) => {
// 		  if (chrome.runtime.lastError) {
// 			console.error("Error capturing stream:", chrome.runtime.lastError);
// 			return;
// 		  }
// 		  console.log("Google Meet Video Stream:", stream);
// 		});
// 	  }
// 	} catch (error) {
// 	  console.error("Error logging Google Meet video stream:", error);
// 	}
//   };
  
//   chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
// 	if (message.type === "logMeetVideoStream" && message.tabId ) {
// 	  logMeetVideoStream(message.tabId);
// 	}
//   });

// const constraints = {
// 	video: true,
//   };
  
//   navigator.mediaDevices
// 	.getUserMedia(constraints)
// 	.then((mediaStream) => {
// 	  const video = document.createElement("video");
// 	  video.srcObject = mediaStream;
// 	  console.log("video tracks", video.srcObject)
// 	  video.onloadedmetadata = () => {
// 		video.play();
// 	  };
// 	})
// 	.catch((err) => {
// 	  // always check for errors at the end.
// 	  console.error(`${err.name}: ${err.message}`);
// 	});

// const script = document.createElement("script");
// script.setAttribute("type", "module");
// script.setAttribute("src", chrome.runtime.getURL("background.ts"));

// import * as tf from "@tensorflow/tfjs";
// import * as cocoSsd from '@tensorflow-models/coco-ssd';
// import '@tensorflow/tfjs-backend-cpu';
// import '@tensorflow/tfjs-backend-webgl';



// let isDetecting = false;
// let videoStream: MediaStream;
// let detectObjectsTimeoutId: number;
// let videoElement: HTMLVideoElement | null = null;
// let canvasElement: HTMLCanvasElement | null = null;
// let ctx: CanvasRenderingContext2D | null = null;
// let model: cocoSsd.ObjectDetection | null = null;


// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === "startDetection") {
//     startDetection();
//   } else if (message.type === "stopDetection") {
//     stopDetection();
//   } else if (message.type === "getStatus") {
//     sendResponse({ isDetecting: isDetecting });
//   }
// });

// const cocoModel = cocoSsd.load();
//   if (!cocoModel) {
//       console.error();
//       console.log("fail to load model");
//   }else 
//   {
//     console.log("the model is loaded", cocoModel)
//   }


// async function startDetection(): Promise<void> {

//   isDetecting = true;
//   chrome.runtime.sendMessage({ type: "statusChange", isDetecting: isDetecting });

//   const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//   if (!stream) {
//     console.error('Could not get video stream.');
//     return;
//   }
//   console.log(stream)
  
//   const video = document.createElement("video");
//   video.srcObject = stream;
//   video.play();


//   async function detectObjects() {
//     const image = tf.browser.fromPixels(video);
//     const predictions = await (await cocoModel).detect(image);

//     if (predictions.length > 0) {
//       console.log("Predictions:", predictions);
//     }
//     image.dispose();
//     if (isDetecting) {
//       requestAnimationFrame(detectObjects);
//     }
//   }
//   requestAnimationFrame(detectObjects);
// }

// startDetection();

// function stopDetection() {
//   isDetecting = false;
//   clearTimeout(detectObjectsTimeoutId);
//   chrome.runtime.sendMessage({ type: "statusChange", isDetecting: isDetecting });

//   if (videoStream) {
//     videoStream.getTracks().forEach((track) => track.stop());
//     videoStream = null;
//   }
// }

// const startCamera = (sendResponse: (response: { streamId: string }) => void) => {
//   console.log("the camera is clicked!");
//   if (!isDetecting) {
//     isDetecting = true;
//     videoElement = document.createElement('video');
//     canvasElement = document.createElement('canvas');
//     ctx = canvasElement.getContext('2d');

//     // retrieve the model from storage
//     chrome.storage.local.get('model', async data => {
//       if (chrome.runtime.lastError) {
//         console.error(chrome.runtime.lastError);
//       } else {
//         const loadedModel = await cocoSsd.load();
//         model = loadedModel;
//         if (model === undefined) {
//           console.error('Model not found in storage.');
//           return;
//         }

//         navigator.mediaDevices.getUserMedia({ video: true })
//           .then(stream => {
//             videoElement!.srcObject = stream;
//             videoElement!.play();
//             videoElement!.onloadedmetadata = () => {
//               canvasElement!.width = videoElement!.videoWidth;
//               canvasElement!.height = videoElement!.videoHeight;
//               setInterval(() => {
//                 ctx!.drawImage(videoElement!, 0, 0);
//                 model!.detect(canvasElement!).then(predictions => {
//                   // display the predictions in the browser
//                   console.log(predictions);
//                 });
//               }, 1000 / 30); // 30 frames per second
//             };
//           })
//           .catch(error => {
//             console.error(error);
//           });
//       }
//     });
//   }
// };

// const stopCamera = (sendResponse: () => void) => {
//   if (stream) {
//     stream.getTracks().forEach((track) => {
//       track.stop();
//     });

//     const video = document.getElementById('camera-feed');
//     if (video) {
//       video.remove();
//     }

//     sendResponse();
//   }
// };

// const saveStreamId = (streamId: string) => {
//   chrome.storage.local.set({ streamId });
// };

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === 'startDetection') {
//     startDetection();
//   } else if (request.action === 'stopDetection') {
//     stopDetection();
//   }
// // });
// async function startDetection() {
//   if (!isDetecting) {
//     isDetecting = true;
//     videoElement = document.createElement('video');
//     canvasElement = document.createElement('canvas');
//     ctx = canvasElement.getContext('2d');
//     const model = await cocoSsd.load();
//     navigator.mediaDevices.getUserMedia({ video: true })
//       .then(stream => {
//         videoElement!.srcObject = stream;
//         videoElement!.play();
//         videoElement!.onloadedmetadata = () => {
//           canvasElement!.width = videoElement!.videoWidth;
//           canvasElement!.height = videoElement!.videoHeight;
//           setInterval(() => {
//             ctx!.drawImage(videoElement!, 0, 0);
//             model.detect(canvasElement!).then(predictions => {
//               // display the predictions in the browser
//               console.log(predictions);
//             });
//           }, 1000 / 30); // 30 frames per second
//         };
//       })
//       .catch(error => {
//         console.error(error);
//       });
//   }
// }

// function stopDetection() {
//   if (isDetecting) {
//     isDetecting = false;
//     videoElement!.pause();
//     (videoElement!.srcObject as MediaStream).getTracks()[0].stop(); // add type assertion
//     videoElement!.srcObject = null;
//     videoElement = null;
//     canvasElement = null;
//     ctx = null;
//   }
// }

