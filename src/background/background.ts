console.log('this is working from background.ts')

// import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

let model: cocoSsd.ObjectDetection;

async function loadModel() {
  try {
    model = await cocoSsd.load();
    chrome.storage.local.set({ model });
    console.log('COCO-SSD model loaded successfully');
  } catch (err) {
    console.log('Failed to load COCO-SSD model', err);
  }
}

loadModel();

// // Load the COCO-SSD model
// cocossd.load().then(model => {
//     // Log a message to the console indicating that the model is loaded
//     console.log('Model loaded.');
//   });

//   function openCam(){
//   const constraints = {
//     video: true
//   };
  
//   const video = document.querySelector('video');
  
//   navigator.mediaDevices.getUserMedia(constraints).
//     then((stream) => {video.srcObject = stream});
// }

// function runCoco (){
//     async () => {
//         // 3. TODO - Load network 
//         // e.g. const net = await cocossd.load();
//         const net = await cocossd.load();
//         if (!net){
//           console.error("the model is not loaded")
//         } 
//           console.log("the model is loaded!")
        
//       };
// } 

// runCoco();