window.onload = function () {
  const canvas = document.getElementById('spectrum-canvas');
  const ctx = canvas.getContext('2d');

  // 固定显示尺寸，不依赖 clientWidth，防止取到0
  const cssWidth = 360;
  const cssHeight = 100;

  const dpr = window.devicePixelRatio || 1;

  canvas.style.width = cssWidth + 'px';   // 设置CSS显示宽高
  canvas.style.height = cssHeight + 'px';

  // 设置实际像素尺寸
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  ctx.scale(dpr, dpr);

  const audio = document.getElementById('audio-player');
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  let sourceConnected = false;

  let currentColor = 'rgb(0, 200, 255)';
  window.setSpectrumColor = function (color) {
    currentColor = color;
  };

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const barWidth = (cssWidth / bufferLength) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] * 0.6;

      ctx.fillStyle = currentColor;
      ctx.fillRect(x, cssHeight - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  audio.onplay = function () {
    if (!sourceConnected) {
      const source = audioCtx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      sourceConnected = true;
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    draw();
  };
};
