/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**************************************!*\
  !*** ./src/background/background.ts ***!
  \**************************************/
console.log('this is working from background.ts');
// import * as tf from '@tensorflow/tfjs';
// import * as cocoSsd from '@tensorflow-models/coco-ssd';
// import '@tensorflow/tfjs-backend-cpu';
// import '@tensorflow/tfjs-backend-webgl';
// let model: cocoSsd.ObjectDetection;
// const loadModel = async () => {
//   console.log("Loading TensorFlow and coco-ssd model...");
//   await tf.ready();
//   model = await cocoSsd.load();
//   console.log("Model loaded successfully!");
// };
// const cocossd = require('@tensorflow-models/coco-ssd');
// if (!cocossd) {
//           console.error();
//           console.log("fail to load model");
//       }else 
//       {
//         console.log("the model is loaded", cocossd)
//       }
chrome.runtime.onInstalled.addListener(() => {
    // loadModel();
    // Create the context menu
    chrome.contextMenus.create({
        id: "startDetecting",
        title: "Start Detection on Google",
        contexts: ["all"],
    });
    chrome.contextMenus.create({
        id: "stopDetecting",
        title: "Stop Detection on Google",
        contexts: ["all"],
    });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'startDetecting') {
        chrome.tabs.sendMessage(tab.id, { type: 'startDetecting' });
    }
    else if (info.menuItemId === 'stopDetecting') {
        chrome.tabs.sendMessage(tab.id, { type: 'stopDetecting' });
    }
});
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === "processFrame") {
//     const { frameData } = message;
//     const img = new Image();
//     const imageURL = URL.createObjectURL(frameData);
//     img.src = imageURL;
//     img.onload = async () => {
//       const predictions = await model.detect(img);
//       console.log("Predictions:", predictions);
//       URL.revokeObjectURL(imageURL);
//       sendResponse(predictions);
//     };
//     return true; // Indicates that the response will be sent asynchronously
//   }
// });
// // Types for Chrome Manifest V3
// type Message = {
//   type: string;
//   tabId?: number;
// };
// // Listen for installation and create a context menu item
// chrome.runtime.onInstalled.addListener(() => {
//   chrome.contextMenus.create({
//     id: "logMeetVideoStream",
//     title: "Log Google Meet Video",
//     contexts: ["page"],
//     documentUrlPatterns: ["*://meet.google.com/*"]
//   })
// });
// // Handle context menu click
// chrome.contextMenus.onClicked.addListener((info, tab) => {
//   if (info.menuItemId === "logMeetVideoStream" && tab) {
//     logMeetVideoStream(tab.id);
//   }
// });
// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "logMeetVideoStream" && tab) {
        chrome.tabs.sendMessage(tab.id, { type: "logMeetVideoStream" });
    }
});
// async function clickMenuCallback() {
//         chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
//             const constraints = {
//                 video: true
//               };
//               const video = document.createElement('video');
//               navigator.mediaDevices.getUserMedia(constraints).
//                 then((stream) => {video.srcObject = stream});
//                 video.play();
//             // Classify the image.
//             const predictions = await cocossd.detect(video);
//             console.log('Predictions: ');
//             console.log(predictions);
//         });
// };
// chrome.runtime.onInstalled.addListener(() => {
//     chrome.contextMenus.create({
//       id: 'contextMenu0',
//       title: 'detect objects with TensorFlow.js ',
//       contexts: ['page'],
//     });
//   });
//   chrome.contextMenus.onClicked.addListener(clickMenuCallback);
// async function loadedModel(){
//     try {
//         const model = await cocoSsd.load();
//         console.log("model is loaded", model);
//     }catch (err){
//         console.log(err)
//         console.log("fail to load model")
//     }
// }
// loadedModel()
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

/******/ })()
;
//# sourceMappingURL=background.js.map