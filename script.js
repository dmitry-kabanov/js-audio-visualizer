// Important constants.
const AUDIO_FILENAME = "belle.wav";
const BACKGROUND_IMAGE_FILENAME = "belle-background 2.png";
const VIDEO_MIME_TYPE = "video/webm;codecs=vp9";
const VIDEO_FILENAME = "belle.webm";
const WIDTH = 1920;
const HEIGHT = 1080;
const FFT_SIZE = 2048;

let audio = new Audio();
audio.src = AUDIO_FILENAME;

const container = document.getElementById("container");
const canvas = document.getElementById("canvas");
canvas.width = WIDTH;
canvas.height = HEIGHT;

const canvasCtx = canvas.getContext("2d");
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let audioSource = audioCtx.createMediaElementSource(audio);
let analyzer = audioCtx.createAnalyser();
audioSource.connect(analyzer);
analyzer.connect(audioCtx.destination);

analyzer.fftSize = FFT_SIZE;
const bufferSize = analyzer.frequencyBinCount;
const dataArray = new Uint8Array(bufferSize);
const barWidth = canvas.width / bufferSize;

let mediaRecorder = null;

const bodyElem = document.querySelector("body");
const recordBtn = document.getElementById("record");

// Used to determine if we start or stop recording.
let isPlaying = false;

let x = 0;

function animate() {
    x = 0;
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.globalCompositeOperation = 'destination-over';
    analyzer.getByteFrequencyData(dataArray);
    canvasCtx.fillStyle = "white";
    for (let i = 0; i < bufferSize; ++i) {
        barHeight = dataArray[i];
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }
    let img = new Image();
    img.src = BACKGROUND_IMAGE_FILENAME;
    canvasCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    requestAnimationFrame(animate);
}

const startRecording = () => {
    const stream = canvas.captureStream(24);
    const options = {
        audioBitsPerSecond: 0,
        videoBitsPerSecond: 6_000_000,
    };
    mediaRecorder = new MediaRecorder(stream, options);
    data = []
    mediaRecorder.ondataavailable = (e) => {data.push(e.data);};
    mediaRecorder.onstop = (e) => 
        downloadVideo(new Blob(data, {type: VIDEO_MIME_TYPE}));
    console.log("mediaRecorder.start()");
    mediaRecorder.start();
};

const downloadVideo = async (blob) => {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.id = "download";
    a.href = url;
    a.download = VIDEO_FILENAME;
    a.className = "button";
    a.innerText = "Click here to download";
    bodyElem.appendChild(a);
  };

recordBtn.addEventListener("click", (e) => {
    if (!isPlaying) {
        console.log("Start recording");
        let link = document.getElementById("download");
        if (link) {
            bodyElem.removeChild(link);
        }
        isPlaying = true;
        recordBtn.textContent = "Stop";
        startRecording();
        audio.play();
        requestAnimationFrame(animate);
    }
    else {
        console.log("Stop recording");
        isPlaying = false;
        recordBtn.textContent = "Start";
        audio.pause();
        audio.currentTime = 0;
        mediaRecorder.stop();
    }
});