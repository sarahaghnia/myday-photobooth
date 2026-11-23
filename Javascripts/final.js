// constants
const WIDTH = 1176, HEIGHT = 2940;

// dom elements
const canvas = document.getElementById('finalCanvas'),
      ctx = canvas.getContext('2d'),
      addFishBtn = document.getElementById('addFish'),
      addOctopusBtn = document.getElementById('addOctopus'),
      addSeaweedBtn = document.getElementById('addSeaweed'),
      addAxBtn = document.getElementById('addAx'),
      addBubbleBtn = document.getElementById('addBubble'),
      downloadBtn = document.getElementById('downloadBtn'),
      homeBtn = document.getElementById('homeBtn'),
      resetBtn = document.getElementById('reset');

// sticker state
let stickers = [], dragOffset = { x: 0, y: 0 }, selectedSticker = null;
let photoReady = false;

// load photo
const finalImage = new Image(), dataURL = localStorage.getItem('photoStrip');
if (dataURL) {
  finalImage.onload = () => {
    photoReady = true;
    drawCanvas();
    downloadBtn.disabled = false;
  };
  finalImage.onerror = () => alert('Could not load your photo strip. Please go back and try again.');
  finalImage.src = dataURL;
  localStorage.removeItem('photoStrip');
} else {
  downloadBtn.disabled = true;
  alert("No photo found!");
}

// draw canvas
function drawCanvas() {
  if (!photoReady) return;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(finalImage, 0, 0, WIDTH, HEIGHT);
  stickers.forEach(s => ctx.drawImage(s.img, s.x, s.y, s.width, s.height));
}

// add sticker
function addSticker(src, scale = 1) {
  const img = new Image();
  img.onload = () => {
    const width = (img.width / 2.5) * scale;
    const height = (img.height / 2.5) * scale;
    const baseX = WIDTH / 2 - img.width / 6;
    const baseY = HEIGHT / 2 - img.height / 6;
    stickers.push({
      img,
      x: baseX - ((width - img.width / 2.5) / 2),
      y: baseY - ((height - img.height / 2.5) / 2),
      width,
      height,
      dragging: false
    });
    drawCanvas();
  };
  img.src = src;
}

// pointer position
function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect(), scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
  const clientX = e.touches?.[0]?.clientX ?? e.clientX,
        clientY = e.touches?.[0]?.clientY ?? e.clientY;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

// drag and drop
function pointerDown(e) {
  const { x: mouseX, y: mouseY } = getPointerPos(e);
  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    if (mouseX >= s.x && mouseX <= s.x + s.width && mouseY >= s.y && mouseY <= s.y + s.height) {
      selectedSticker = s;
      s.dragging = true;
      dragOffset.x = mouseX - s.x;
      dragOffset.y = mouseY - s.y;
      stickers.splice(i, 1);
      stickers.push(s);
      drawCanvas();
      e.preventDefault();
      break;
    }
  }
}
function pointerMove(e) {
  if (!selectedSticker?.dragging) return;
  const { x: mouseX, y: mouseY } = getPointerPos(e);
  selectedSticker.x = mouseX - dragOffset.x;
  selectedSticker.y = mouseY - dragOffset.y;
  drawCanvas();
  e.preventDefault();
}
function pointerUp() { if (selectedSticker) selectedSticker.dragging = false; selectedSticker = null; }

canvas.addEventListener('mousedown', pointerDown);
canvas.addEventListener('mousemove', pointerMove);
canvas.addEventListener('mouseup', pointerUp);
canvas.addEventListener('mouseleave', pointerUp);
canvas.addEventListener('touchstart', pointerDown);
canvas.addEventListener('touchmove', pointerMove);
canvas.addEventListener('touchend', pointerUp);
canvas.addEventListener('touchcancel', pointerUp);

addFishBtn.addEventListener('click', () => addSticker('Assets/fish-photobooth/camerapage/stickers/fish.png'));
addOctopusBtn.addEventListener('click', () => addSticker('Assets/fish-photobooth/camerapage/stickers/octopus.png'));

const seaweedImages = ['Assets/fish-photobooth/camerapage/stickers/seaweed1.png','Assets/fish-photobooth/camerapage/stickers/seaweed2.png'],
      bubbleImages = ['Assets/fish-photobooth/camerapage/stickers/bubble1.png','Assets/fish-photobooth/camerapage/stickers/bubble2.png'];
let seaweedIndex = 0, bubbleIndex = 0;

addSeaweedBtn.addEventListener('click', () => {
  const image = seaweedImages[seaweedIndex];
  addSticker(image, seaweedIndex === 0 ? 1.1 : 1);
  seaweedIndex = (seaweedIndex + 1) % seaweedImages.length;
});
addAxBtn.addEventListener('click', () => addSticker('Assets/fish-photobooth/camerapage/stickers/axolotl.png'));
addBubbleBtn.addEventListener('click', () => { addSticker(bubbleImages[bubbleIndex]); bubbleIndex = (bubbleIndex + 1) % bubbleImages.length; });

resetBtn.addEventListener('click', () => { stickers = []; drawCanvas(); });

// Download the current canvas directly as a PNG file (no new tab).
downloadBtn.addEventListener('click', () => {
  if (!photoReady) return;
  canvas.toBlob(blob => {
    if (!blob) {
      alert('Could not create your PNG. Please try again.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'myday-photobooth.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
});

homeBtn.addEventListener('click', () => window.location.href = 'index.html');
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', () => window.location.href = 'index.html');
});