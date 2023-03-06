window.onload= () => {
	console.log("I am from content Script.");
}



let stream: MediaStream;

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
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((s) => {
      stream = s;

      const video = document.createElement('video');
      video.id = 'camera-feed';
      video.autoplay = true;
      video.muted = true;
      video.srcObject = stream;
      video.style.position = 'fixed';
      video.style.top = '0';
      video.style.left = '0';
      video.style.zIndex = '9999';

      document.body.appendChild(video);

      const streamId = stream.id;
      sendResponse({ streamId });
    })
    .catch((err) => {
      console.error(err);
    });
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