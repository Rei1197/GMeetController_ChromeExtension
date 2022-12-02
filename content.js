// declare global variable
let video = null; // video element
let detector = null; // detector object
let detections = []; // store detection result
let videoVisibility = true;
let detecting = false;

// set cursor to wait until video elment is loaded
document.body.style.cursor = 'wait';


async function load() {
    const res = await fetch(chrome.runtime.getURL('cs.js'), { method: 'GET' })
    const js = await res.text()
    const script = document.createElement('script')
    script.textContent = js
    document.body.insertBefore(script, document.body.firstChild)
  
    // --- tfjs ---
    const res_tf = await fetch('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.2', { method: 'GET' })
    const js_tf = await res_tf.text();
    const script_tf = document.createElement('script');
    script_tf.textContent = js_tf;
  
    // --- bodypix ---
    const script_bp = document.createElement('script');
    script_bp.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.0';
  
    document.body.insertBefore(script_bp, document.body.firstChild);
    document.body.insertBefore(script_tf, document.body.firstChild);
  }
  
  const _PRINT_LOADER_LOG = false;
  function _loaderlog(var_args) {
    if (_PRINT_LOADER_LOG) {
      console.log(...arguments);
    }
  }

  // The setup() function is called once when the program starts.
function setup() {
    // create canvas element with 640 width and 480 height in pixel
    createCanvas(640, 480);
    // Creates a new HTML5 <video> element that contains the audio/video feed from a webcam.
    // The element is separate from the canvas and is displayed by default.
    video = createCapture(VIDEO);
    video.size(640, 480);
    console.log('video element is created');
    video.elt.addEventListener('loadeddata', function() {
      // set cursor back to default
      if (video.elt.readyState >= 2) {
        document.body.style.cursor = 'default';
        console.log('video element is ready! Click "Start Detecting" to see the magic!');
      }
    });
  }

  function toggleVideo() {
    if (!video) return;
    if (videoVisibility) {
      video.hide();
      toggleVideoEl.innerText = 'Show Video';
    } else {
      video.show();
      toggleVideoEl.innerText = 'Hide Video';
    }
    videoVisibility = !videoVisibility;
  }
  
  function toggleDetecting() {
    if (!video || !detector) return;
    if (!detecting) {
      detect();
      toggleDetectingEl.innerText = 'Stop Detecting';
    } else {
      toggleDetectingEl.innerText = 'Start Detecting';
    }
    detecting = !detecting;
  }
  
  function detect() {
    // instruct "detector" object to start detect object from video element
    // and "onDetected" function is called when object is detected
    detector.detect(video, onDetected);
  }
  
  // callback function. it is called when object is detected
  function onDetected(error, results) {
    if (error) {
      console.error(error);
    }
    detections = results;
    // keep detecting object
    if (detecting) {
      detect(); 
    }
  }

  // the draw() function continuously executes until the noLoop() function is called
function draw() {
    if (!video || !detecting) return;
    // draw video frame to canvas and place it at the top-left corner
    image(video, 0, 0);
    // draw all detected objects to the canvas
    for (let i = 0; i < detections.length; i++) {
      drawResult(detections[i]);
    }
  }
  
  function drawResult(object) {
    drawBoundingBox(object);
    drawLabel(object);
  }
  
  // draw bounding box around the detected object
  function drawBoundingBox(object) {
    // Sets the color used to draw lines.
    stroke('green');
    // width of the stroke
    strokeWeight(4);
    // Disables filling geometry
    noFill();
    // draw an rectangle
    // x and y are the coordinates of upper-left corner, followed by width and height
    rect(object.x, object.y, object.width, object.height);
  }
  
  // draw label of the detected object (inside the box)
  function drawLabel(object) {
    // Disables drawing the stroke
    noStroke();
    // sets the color used to fill shapes
    fill('white');
    // set font size
    textSize(24);
    // draw string to canvas
    text(object.label, object.x + 10, object.y + 24);
  }
  
  // window.addEventListener('load', (evt) => {
  //   _loaderlog('event load'); // 元のindex.html の中の処理より後に呼ばれる
  //   load()
  // }, false)
  
  window.addEventListener('load', async (evt) => {
    _loaderlog('event load'); // 元のindex.html の中の処理より後に呼ばれる
    await load()
  }, true) // use capture
  
  _loaderlog('loader.js');
  
  