console.log("this from src script!");

//  <script type="module" src="src/index.js"></script>を作成
const script = document.createElement("script");
script.setAttribute("type", "module");
script.setAttribute("src", chrome.runtime.getURL("index.js"));

const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;

if (head) {
  head.insertBefore(script, head.lastChild);
} else {
  console.error("Could not find the head element to insert the script.");
}

// ----------------------------------------------------------------------------------------------------///

// const video = document.getElementById("video-element");

// const constraints = { video: true };

// navigator.mediaDevices.getUserMedia({video: true})
//   .then(function(stream) {
//     console.log("I got the camera opened!");
//     // // Attach the media stream to the video element
//     // video.srcObject = stream;
//   })
//   .catch(function(error) {
//     console.error("Error accessing camera: ", error);
//   });


// var video_button = document.querySelector("VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ tWDL4c uaILN JxICCe ztnpif HNeRed");
// const videoButton = document.querySelectorAll(".VfPpkd-Bz112c-LgbsSe.yHy1rc.eT1oJ.tWDL4c.uaILN")[1];

// console.log(document.querySelectorAll(".VfPpkd-Bz112c-LgbsSe.yHy1rc.eT1oJ.tWDL4c.uaILN"));
// console.log(videoButton)
// const constraints = { video: true};

//google meet video button off : VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ tWDL4c uaILN JxICCe ztnpif FTMc0c N2RpBe jY9Dbb

// videoButton.addEventListener("click", function (){

//     console.log("the video button has been clicked!")
// })

// navigator.mediaDevices.getUserMedia({video: true})
// .then(function(stream){
//     console.log("I got the camera opened!");
//     console.log(video)

//     video.srcObject = stream;
//     console.log(stream)
// })
// .catch(function(error){
//     console.error("Error accessing camera: ", error);
// });