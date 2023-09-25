// import * as onnx from "onnxjs";
// import * as cocoSsd from "@tensorflow-models/coco-ssd"; // For COCO labels
// import { loadONNXModel, detectObjectsYOLOv8 } from "./yolov8"; // Custom YOLOv8 functions

// let isDetecting = false;

// chrome.runtime.onMessage.addListener(async (message: any) => {
//   if (message.type === "startDetecting") {
//     isDetecting = true;
//     await logMeetVideoStream();
//   } else if (message.type === "stopDetecting") {
//     isDetecting = false;
//     const videoElements = findVideoElements();
//     for (const video of videoElements) {
//       const canvas = video.parentElement.querySelector("canvas");
//       if (canvas) {
//         clearCanvas(canvas);
//       }
//     }
//   }
// });

// const updateOffscreenCanvasDimensions = (div, offscreenCanvas) => {
//   const width = div.clientWidth;
//   const height = div.clientHeight;

//   offscreenCanvas.width = width;
//   offscreenCanvas.height = height;
// };

// const captureVideoFrame = async (videoElement) => {
//   const div = videoElement.closest(".p2hjYe.TPpRNe");
//   const offscreenCanvas = new OffscreenCanvas(
//     videoElement.videoWidth,
//     videoElement.videoHeight
//   );
//   updateOffscreenCanvasDimensions(div, offscreenCanvas);

//   const ctx = offscreenCanvas.getContext("2d");
//   ctx.drawImage(
//     videoElement,
//     0,
//     0,
//     offscreenCanvas.width,
//     offscreenCanvas.height
//   );
//   return ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
// };

// const findVideoElements = () => {
//   const containerElements = document.getElementsByClassName("p2hjYe TPpRNe"); // Change this selector as needed
//   const videoElements = [];

//   for (const container of Array.from(containerElements)) {
//     const videos = container.getElementsByTagName("video");
//     if (videos.length > 0) {
//       videoElements.push(videos[0]);
//     }
//   }
//   return videoElements;
// };

// const processFrame = async (
//   video,
//   canvas,
//   model,
//   yoloModel
// ) => {
//   if (!isDetecting) return;

//   if (video.videoWidth === 0 || video.videoHeight === 0) {
//     requestAnimationFrame(() => processFrame(video, canvas, model, yoloModel));
//     return;
//   }

//   canvas.width = video.clientWidth;
//   canvas.height = video.clientHeight;
//   canvas.style.left = video.offsetLeft + "px";
//   canvas.style.top = video.offsetTop + "px";

//   const frameData = await captureVideoFrame(video);
//   const predictions = await detectObjectsYOLOv8(yoloModel, frameData);

//   const ctx = canvas.getContext("2d");
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   for (const prediction of predictions) {
//     ctx.strokeStyle = "#FF0000";
//     ctx.lineWidth = 2;
//     ctx.strokeRect(
//       prediction.bbox[0],
//       prediction.bbox[1],
//       prediction.bbox[2],
//       prediction.bbox[3]
//     );
//     ctx.font = "14px Arial";
//     ctx.fillStyle = "#FF0000";
//     ctx.fillText(
//       `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
//       prediction.bbox[0],
//       prediction.bbox[1] - 5
//     );
//   }
//   requestAnimationFrame(() =>
//     processFrame(video, canvas, model, yoloModel)
//   );
// };

// const logMeetVideoStream = async () => {
//   const videos = findVideoElements();
//   console.log(`Number of video elements: ${videos.length}`);

//   if (videos.length === 0) {
//     console.error("No video elements found on the page.");
//     return;
//   }

//   console.log("Loading COCO-SSD model...");
//   await tf.ready();
//   const cocoModel = await cocoSsd.load();
//   console.log("COCO-SSD Model loaded successfully.");

//   console.log("Loading YOLOv8 model...");
//   const yoloModel = await loadONNXModel("path/to/yolov8/model.onnx");
//   console.log("YOLOv8 Model loaded successfully.");

//   for (const video of videos) {
//     const canvas = document.createElement("canvas");
//     canvas.width = video.clientWidth;
//     canvas.height = video.clientHeight;
//     canvas.style.position = "absolute";
//     canvas.style.top = "0";
//     canvas.style.left = "0";
//     canvas.style.pointerEvents = "none";
//     canvas.style.zIndex = "1000";
//     video.parentElement.appendChild(canvas);
//     const parentElement = video.parentElement;
//     parentElement.style.position = "relative";
//     parentElement.appendChild(canvas);
//     processFrame(video, canvas, cocoModel, yoloModel);
//   }
// };

// const clearCanvas = (canvas) => {
//   const ctx = canvas.getContext("2d");
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
// };

// // Custom function to load YOLOv8 model using ONNX.js
// const loadONNXModel = async (modelPath) => {
//   const session = new onnx.InferenceSession();
//   await session.loadModel(modelPath);
//   return session;
// };

// // Custom function to perform object detection with YOLOv8
// const detectObjectsYOLOv8 = async (model, frameData) => {
//   // Implement YOLOv8 object detection here
//   // You will need to preprocess the frameData and post-process the predictions
//   // Consult the documentation of your YOLOv8 model for details
// };
