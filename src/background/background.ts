console.log('this is working from background.ts')

import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";


console.log(tf.getBackend());

console.log("the tensorflow version is: ",tf.version)

// Load the COCO-SSD model
cocossd.load().then(model => {
    // Log a message to the console indicating that the model is loaded
    console.log('Model loaded.');
  });
  


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