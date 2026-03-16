let audioContext;
let analyser;
let microphone;
let dataArray;

async function startAudioListening() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  audioContext = new AudioContext();
  microphone = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();

  analyser.fftSize = 256;
  microphone.connect(analyser);

  dataArray = new Uint8Array(analyser.frequencyBinCount);

  listenLoop();
}

function listenLoop() {
  analyser.getByteFrequencyData(dataArray);

  let volume = dataArray.reduce((a, b) => a + b) / dataArray.length;

  if (volume > 18) {
    revealCluster();
  }

  requestAnimationFrame(listenLoop);
}

demoSurface.addEventListener("dblclick", startAudioListening);
