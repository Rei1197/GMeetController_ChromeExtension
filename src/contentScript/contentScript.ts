import * as tf from "@tensorflow/tfjs";

let isDetecting = false;
let videoElements: HTMLVideoElement[] = [];
let canvasElements: HTMLCanvasElement[] = [];
let contextElements: CanvasRenderingContext2D[] = [];
let boxes = [];
let interval;
let busy = false;
let customModelURL = chrome.runtime.getURL('yolov8n_web_model.json');
let model: tf.GraphModel | null = null;
let ort = null; // ONNX Runtime

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'startDetecting') {
    isDetecting = true;
    const loadedModel = await loadModel();
    ort = await loadONNXRuntimeModel(); // Load ONNX Runtime model
    if (loadedModel && ort) {
      startDetection();
    }
  } else if (message.type === 'stopDetecting') {
    stopDetection();
  }
});

function findVideo() {
  const videoClass = document.getElementsByClassName("p2hjYe TPpRNe");
  const videos: HTMLVideoElement[] = [];

  for (const container of Array.from(videoClass)) {
    const videoElements = container.getElementsByTagName("video");
    if (videoElements.length > 0) {
      videos.push(videoElements[0]);
    }
  }

  return videos;
}

const loadModel = async () => {
  // Find the video on Google Meet
  const meetVideo = findVideo();
  console.log(`Number of video elements: ${meetVideo.length}`);
  if (meetVideo.length == 0) {
    console.error("No video elements found on the page.");
    return;
  }

  // Loading the custom model
  console.log('Loading model...');
  try {
    await tf.setBackend('webgl');
    if (tf.ready()) {
      model = await tf.loadGraphModel(customModelURL);
      console.log("Model loaded successfully");
      return model;
    } else {
      console.error('TensorFlow.js backend is not ready.');
      return null;
    }
  } catch (error) {
    console.error("Failed to load the model: ", error);
    return null;
  }
};

const loadONNXRuntimeModel = async () => {
  try {
    const ortModule = await import("../assests/ort.min.js");
    const ort = ortModule.default;
    return ort;
  } catch (error) {
    console.error("Failed to load ONNX Runtime: ", error);
    return null;
  }
};

async function startDetection() {
  if (!model || !ort) {
    console.error("Model or ONNX Runtime is not loaded yet.");
    return;
  }

  if (!isDetecting) {
    isDetecting = true;
    videoElements = findVideo();

    if (videoElements.length === 0) {
      console.error('Could not find any video elements on the page.');
      return;
    }

    // Initialize canvas and context for each video element
    for (const video of videoElements) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      canvasElements.push(canvas);
      contextElements.push(context);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play();

      interval = setInterval(async () => {
        const canvasIndex = videoElements.indexOf(video);
        contextElements[canvasIndex].drawImage(video, 0, 0);
        
        // Capture the canvas as an image and perform inference using ONNX Runtime
        const input = prepare_input(canvasElements[canvasIndex]);
        const output = await runONNXModel(input);
        
        boxes = process_output(output, canvasElements[canvasIndex].width, canvasElements[canvasIndex].height);
      }, 30);
    }
  }
}

async function runONNXModel(input) {
  if (!ort) {
    console.error("ONNX Runtime is not loaded.");
    return null;
  }

  try {
    const session = new ort.InferenceSession();
    await session.loadModel("yolov8n.onnx");
    const inputTensor = new ort.Tensor(new Float32Array(input), [1, 3, 640, 640]);
    const outputMap = await session.run({ images: inputTensor });
    return outputMap.output0.data;
  } catch (error) {
    console.error("Failed to run ONNX model: ", error);
    return null;
  }
}

function stopDetection() {
  isDetecting = false;
  clearInterval(interval);
  for (const video of videoElements) {
    const mediaStream = video.srcObject as MediaStream | null;
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    video.srcObject = null;
  }
}
  

function prepare_input(img) {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 640;
    const context = canvas.getContext("2d");
    context.drawImage(img, 0, 0, 640, 640);
    const data = context.getImageData(0,0,640,640).data;
    const red = [], green = [], blue = [];
    for (let index=0;index<data.length;index+=4) {
        red.push(data[index]/255);
        green.push(data[index+1]/255);
        blue.push(data[index+2]/255);
    }
    return [...red, ...green, ...blue];
}

function process_output(output, img_width, img_height) {
    let boxes = [];
    for (let index=0;index<8400;index++) {
        const [class_id,prob] = [...Array(yolo_classes.length).keys()]
            .map(col => [col, output[8400*(col+4)+index]])
            .reduce((accum, item) => item[1]>accum[1] ? item : accum,[0,0]);
        if (prob < 0.5) {
            continue;
        }
        const label = yolo_classes[class_id];
        const xc = output[index];
        const yc = output[8400+index];
        const w = output[2*8400+index];
        const h = output[3*8400+index];
        const x1 = (xc-w/2)/640*img_width;
        const y1 = (yc-h/2)/640*img_height;
        const x2 = (xc+w/2)/640*img_width;
        const y2 = (yc+h/2)/640*img_height;
        boxes.push([x1,y1,x2,y2,label,prob]);
    }
    boxes = boxes.sort((box1,box2) => box2[5]-box1[5])
    const result = [];
    while (boxes.length>0) {
        result.push(boxes[0]);
        boxes = boxes.filter(box => iou(boxes[0],box)<0.7 || boxes[0][4] !== box[4]);
    }
    return result;
}

function iou(box1,box2) {
    return intersection(box1,box2)/union(box1,box2);
}

function union(box1,box2) {
    const [box1_x1,box1_y1,box1_x2,box1_y2] = box1;
    const [box2_x1,box2_y1,box2_x2,box2_y2] = box2;
    const box1_area = (box1_x2-box1_x1)*(box1_y2-box1_y1)
    const box2_area = (box2_x2-box2_x1)*(box2_y2-box2_y1)
    return box1_area + box2_area - intersection(box1,box2)
}

function intersection(box1,box2) {
    const [box1_x1,box1_y1,box1_x2,box1_y2] = box1;
    const [box2_x1,box2_y1,box2_x2,box2_y2] = box2;
    const x1 = Math.max(box1_x1,box2_x1);
    const y1 = Math.max(box1_y1,box2_y1);
    const x2 = Math.min(box1_x2,box2_x2);
    const y2 = Math.min(box1_y2,box2_y2);
    return (x2-x1)*(y2-y1)
}

function draw_boxes(canvas,boxes) {
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 3;
    ctx.font = "18px serif";
    boxes.forEach(([x1,y1,x2,y2,label]) => {
        ctx.strokeRect(x1,y1,x2-x1,y2-y1);
        ctx.fillStyle = "#00ff00";
        const width = ctx.measureText(label).width;
        ctx.fillRect(x1,y1,width+10,25);
        ctx.fillStyle = "#000000";
        ctx.fillText(label, x1, y1+18);
    });
}

const yolo_classes = [
    'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
    'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse',
    'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase',
    'frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard',
    'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
    'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant',
    'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven',
    'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
];