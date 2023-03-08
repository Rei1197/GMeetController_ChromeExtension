window.onload= () => {
	console.log("I am from content Script.");
}

import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';


// async function loadModel() {
//   try{
//   const model = await cocoSsd.load();
//   chrome.storage.local.set({ model });
//   tf.setBackend('cpu'); // register TensorFlow.js backend
//   console.log('COCO-SSD model loaded successfully');
// } catch (err) {
//   console.log('Failed to load COCO-SSD model', err);
// }
// }

// chrome.runtime.onInstalled.addListener(loadModel);

let stream: MediaStream;
let isDetecting = false;
let videoElement: HTMLVideoElement | null = null;
let canvasElement: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let model: cocoSsd.ObjectDetection | null = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startCamera':
      startCamera(sendResponse);
      break;
    case 'stopCamera':
      stopCamera(sendResponse);
      break;
    case 'saveStreamId':
      saveStreamId(message.streamId);
      break;
    default:
      break;
  }

  return true;
});

const startCamera = (sendResponse: (response: { streamId: string }) => void) => {
  console.log("the camera is clicked!");
  if (!isDetecting) {
    isDetecting = true;
    videoElement = document.createElement('video');
    canvasElement = document.createElement('canvas');
    ctx = canvasElement.getContext('2d');

    // retrieve the model from storage
    chrome.storage.local.get('model', async data => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        const loadedModel = await cocoSsd.load();
        model = loadedModel;
        if (model === undefined) {
          console.error('Model not found in storage.');
          return;
        }

        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            videoElement!.srcObject = stream;
            videoElement!.play();
            videoElement!.onloadedmetadata = () => {
              canvasElement!.width = videoElement!.videoWidth;
              canvasElement!.height = videoElement!.videoHeight;
              setInterval(() => {
                ctx!.drawImage(videoElement!, 0, 0);
                model!.detect(canvasElement!).then(predictions => {
                  // display the predictions in the browser
                  console.log(predictions);
                });
              }, 1000 / 30); // 30 frames per second
            };
          })
          .catch(error => {
            console.error(error);
          });
      }
    });
  }
};

const stopCamera = (sendResponse: () => void) => {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });

    const video = document.getElementById('camera-feed');
    if (video) {
      video.remove();
    }

    sendResponse();
  }
};

const saveStreamId = (streamId: string) => {
  chrome.storage.local.set({ streamId });
};

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

