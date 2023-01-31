// this is from the tutorial of zendev

// もろもろの要素の設定
const canvas = document.createElement('canvas');
const video  = document.createElement('video');
video.width    = 640
video.height   = 480
video.autoplay = true
canvas.width = 640;
canvas.height = 480;
const ctx = canvas.getContext('2d');
let text = "スパイダーマン";
let color = '#ff0000'
	
// 元々のgetUserMedia()を持っておく
const _getUserMedia = navigator.mediaDevices.getUserMedia.bind(
    navigator.mediaDevices
);

// getUserMedia()の上書きして、カメラのstreamではなくcanvasのstreamを取得する
navigator.mediaDevices.getUserMedia = async function (constraints) {
    // canvasのStream情報を取得する
    const stream = await getCaptureCanvasStream();
    return stream;
};

async function getCaptureCanvasStream(){
    // 所持しているgetUserMediaでカメラの映像を取得
    _getUserMedia({video: {
      width: "640px",
      height: "480px"
    }, audio: false}).then(function(stream) {
	// 非表示のvideoエレメントにWebカメラの映像を表示させる
        video.srcObject = stream;
    });

    // video要素の映像を非表示のcanvasに描画する
    _drawCanvas();
    
    // canvasのStreamを取得
    const stream = canvas.captureStream(10);
    return stream;
}


function _drawCanvas() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  // 文字の描画
  _drawText();
  requestAnimationFrame(_drawCanvas);
};

function _drawText(){
  //文字のスタイルを指定
  ctx.font = "70px kirugo";
  ctx.fillStyle = color;
  //文字の配置の指定
  ctx.textBaseline = 'center';
  ctx.textAlign = 'center';
  //座標を指定して文字を描く（座標は画像の中心に）
  var x = (canvas.width / 2);
  var y = (canvas.height / 1.2);
  ctx.fillText(text, x, y);
}