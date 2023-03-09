window.onload= () => {
	console.log("I am from content Script.");
}


import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from '@tensorflow-models/coco-ssd';



let isDetecting = false;
let videoStream: MediaStream;
let detectObjectsTimeoutId: number;
let videoElement: HTMLVideoElement | null = null;
let canvasElement: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let model: cocoSsd.ObjectDetection | null = null;


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startDetection") {
    startDetection();
  } else if (message.type === "stopDetection") {
    stopDetection();
  } else if (message.type === "getStatus") {
    sendResponse({ isDetecting: isDetecting });
  }
});
export async function loadModel(): Promise<tf.GraphModel> {
  const model = await tf.loadGraphModel('https://tfhub.dev/tensorflow/tfjs-model/coco-ssd/1/default/1');
  console.log('Model loaded.');
  return model;
}

async function startDetection(): Promise<void> {

  isDetecting = true;
  chrome.runtime.sendMessage({ type: "statusChange", isDetecting: isDetecting });

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  if (!stream) {
    console.error('Could not get video stream.');
    return;
  }
  
  const video = document.createElement("video");
  video.srcObject = stream;
  video.play();

  const model = await loadModel()
  const cocoModel = await cocoSsd.load()

  async function detectObjects() {
    const image = tf.browser.fromPixels(video);
    const predictions = await cocoModel.detect(image);

    if (predictions.length > 0) {
      console.log("Predictions:", predictions);
    }
    image.dispose();
    if (isDetecting) {
      requestAnimationFrame(detectObjects);
    }
  }
  requestAnimationFrame(detectObjects);
}

function stopDetection() {
  isDetecting = false;
  clearTimeout(detectObjectsTimeoutId);
  chrome.runtime.sendMessage({ type: "statusChange", isDetecting: isDetecting });

  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
    videoStream = null;
  }
}

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

