import React from 'react';
import {createRoot} from 'react-dom/client'
import './popup.css'

const test =(
    <div>
        <h1>Hello World</h1>
        <p>The world we live in is constantly evolving, and we need to adapt to these changes to thrive. We need to be resilient and open to new ideas and perspectives. We need to be proactive and take action to create a better future for ourselves and for those around us.</p>
        <h1>Object Detection Model with #TFJS.</h1>
    <h2> Instruction </h2>
    <p>Wait for the model to load before clicking the button to enable the webcam - at which point it will become visible to use.</p>
    <div>
      <div> 
        <p>Hold some objects up close to your webcam to get a real-time classification! </p>
        <p> When ready, click "enable webcam" below and accept access to the webcam when the browser asks (check the top left of your window)</p>
      </div>
     
          <div id="liveView">
            <button id="webcamButton">Enable Webcam</button>
          </div>
   
    </div>
    </div>
)

const container = document.createElement('div')
document.body.appendChild(container)

const root = createRoot(container)
root.render(test)