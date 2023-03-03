
const model = tf.loadLayersModel('localstorage://my-model-1');
let video;

navigator.mediaDevices.getUserMedia({
  audio: false,
  video: true
}).then(stream =>{

  const videoTracks = stream.getVideoTracks();
  videoTracks.srcObject = stream 
  console.log('Video track', videoTracks)
  videoTracks.play();
  video = videoTracks
  console.log(video)

}).catch(console.error)


if (model !== undefined){
  console.log("the model has been loaded!")
}

// navigator.mediaDevices.getUserMedia({ video: true, audio: false })
//   .then(stream => {
//     const audioTracks = stream.getAudioTracks();
//     console.log('Number of audio tracks:', audioTracks.length);
//     audioTracks.forEach(track => console.log('Audio track:', track));

//     const videoTracks = stream.getVideoTracks();
//     console.log('Number of video tracks:', videoTracks.length);
//     videoTracks.forEach(track => console.log('Video track:', track));
//     videoElement.srcObject = track[0];
//     videoElement.play()
//   })
//   .catch(error => {
//     console.error(error);
//   });
