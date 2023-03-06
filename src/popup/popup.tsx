import React, { useState } from 'react';
import {createRoot} from 'react-dom/client'
import './popup.css'


const Popup: React.FC = () => {
  const [streamId, setStreamId] = useState<string | undefined>(undefined);
  const [cameraOn, setCameraOn] = useState<boolean>(false);

  const startCamera = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'startCamera' }, (response) => {
        setStreamId(response.streamId);
        setCameraOn(true);

        chrome.tabs.sendMessage(tabs[0].id, { action: 'saveStreamId', streamId: response.streamId });
      });
    });
  };

  const stopCamera = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'stopCamera' }, () => {
        setStreamId(undefined);
        setCameraOn(false);
      });
    });
  };

  return (
    <div>
      {cameraOn ? (
        <div>
          <video id="camera-feed" autoPlay muted></video>
          <button onClick={stopCamera}>Stop Camera</button>
        </div>
      ) : (
        <button onClick={startCamera}>Start Camera</button>
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