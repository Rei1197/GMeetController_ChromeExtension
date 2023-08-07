import React, { useState, useEffect } from 'react';
import {createRoot} from 'react-dom/client'
import './popup.css'


const Popup: React.FC = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResults, setDetectionResults] = useState([]);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "getStatus" }, (response) => {
      setIsDetecting(response.isDetecting);
    });
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "statusChange") {
        setIsDetecting(message.isDetecting);
      } else if (message.type === "detectionResult") {
        setDetectionResults(message.results);
      }
    });
  }, []);

  const handleStartDetection = () => {
    chrome.runtime.sendMessage({ type: "startDetection" });
  };

  const handleStopDetection = () => {
    chrome.runtime.sendMessage({ type: "stopDetection" });
    setDetectionResults([]);
  };


  return (
    <div className="popup">
      <h1>Object Detection</h1>
      <p>Status: {isDetecting ? "Detecting" : "Not detecting"}</p>
      <div>
        <button disabled={isDetecting} onClick={handleStartDetection}>
          Start Detection
        </button>
        <button disabled={!isDetecting} onClick={handleStopDetection}>
          Stop Detection
        </button>
      </div>
      {detectionResults.length > 0 && (
        <div>
          <h2>Detection Results</h2>
          <ul>
            {detectionResults.map((result, index) => (
              <li key={index}>{JSON.stringify(result)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Popup;


const test =(
   <Popup></Popup>
)

const container = document.createElement('div')
document.body.appendChild(container)

const root = createRoot(container)
root.render(test)