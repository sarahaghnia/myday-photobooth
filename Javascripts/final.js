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
      resetBtn = document.getElementById('reset'),
      deleteStickerBtn = document.getElementById('deleteStickerBtn');

// sticker state
let stickers = [], dragOffset = { x: 0, y: 0 }, selectedSticker = null;
let isDragging = false, isResizing = false, resizeStart = null;
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
function drawCanvas(showSelection = true) {
  if (!photoReady) return;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(finalImage, 0, 0, WIDTH, HEIGHT);
  stickers.forEach(s => ctx.drawImage(s.img, s.x, s.y, s.width, s.height));

  // Selection outline and resize handle are editor-only; they are excluded from downloads.
  if (showSelection && selectedSticker) {
    const s = selectedSticker;
    const handleSize = 34;
    ctx.save();
    ctx.setLineDash([12, 9]);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#92d6ad';
    ctx.strokeRect(s.x, s.y, s.width, s.height);
    ctx.setLineDash([]);
    ctx.fillStyle = '#fffae9';
    ctx.strokeStyle = '#92d6ad';
    ctx.lineWidth = 6;
    ctx.fillRect(s.x + s.width - handleSize / 2, s.y + s.height - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(s.x + s.width - handleSize / 2, s.y + s.height - handleSize / 2, handleSize, handleSize);
    ctx.restore();
  }
  if (deleteStickerBtn) deleteStickerBtn.disabled = !selectedSticker;
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

// Drag stickers to move them; drag the green corner handle to resize.
function pointerDown(e) {
  const { x: mouseX, y: mouseY } = getPointerPos(e);
  const handleSize = 54;

  if (selectedSticker &&
      mouseX >= selectedSticker.x + selectedSticker.width - handleSize &&
      mouseX <= selectedSticker.x + selectedSticker.width + handleSize / 2 &&
      mouseY >= selectedSticker.y + selectedSticker.height - handleSize &&
      mouseY <= selectedSticker.y + selectedSticker.height + handleSize / 2) {
    isResizing = true;
    resizeStart = {
      x: mouseX,
      y: mouseY,
      width: selectedSticker.width,
      height: selectedSticker.height
    };
    e.preventDefault();
    return;
  }

  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    if (mouseX >= s.x && mouseX <= s.x + s.width &&
        mouseY >= s.y && mouseY <= s.y + s.height) {
      selectedSticker = s;
      isDragging = true;
      dragOffset.x = mouseX - s.x;
      dragOffset.y = mouseY - s.y;
      stickers.splice(i, 1);
      stickers.push(s);
      drawCanvas();
      e.preventDefault();
      return;
    }
  }

  selectedSticker = null;
  drawCanvas();
}

function pointerMove(e) {
  if (!selectedSticker) return;
  const { x: mouseX, y: mouseY } = getPointerPos(e);

  if (isResizing && resizeStart) {
    const scaleX = (mouseX - resizeStart.x + resizeStart.width) / resizeStart.width;
    const scaleY = (mouseY - resizeStart.y + resizeStart.height) / resizeStart.height;
    const scale = Math.max(0.2, Math.abs(scaleX - 1) >= Math.abs(scaleY - 1) ? scaleX : scaleY);
    selectedSticker.width = resizeStart.width * scale;
    selectedSticker.height = resizeStart.height * scale;
    drawCanvas();
    e.preventDefault();
    return;
  }

  if (isDragging) {
    selectedSticker.x = mouseX - dragOffset.x;
    selectedSticker.y = mouseY - dragOffset.y;
    drawCanvas();
    e.preventDefault();
  }
}

function pointerUp() {
  isDragging = false;
  isResizing = false;
  resizeStart = null;
}

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
  addSticker(image, seaweedIndex === 0 ? 1.32 : 1);
  seaweedIndex = (seaweedIndex + 1) % seaweedImages.length;
});
addAxBtn.addEventListener('click', () => addSticker('Assets/fish-photobooth/camerapage/stickers/axolotl.png'));
addBubbleBtn.addEventListener('click', () => { addSticker(bubbleImages[bubbleIndex]); bubbleIndex = (bubbleIndex + 1) % bubbleImages.length; });

resetBtn.addEventListener('click', () => { stickers = []; selectedSticker = null; drawCanvas(); });

deleteStickerBtn.addEventListener('click', () => {
  if (!selectedSticker) return;
  stickers = stickers.filter(sticker => sticker !== selectedSticker);
  selectedSticker = null;
  drawCanvas();
});

// Build the image synchronously, then use Android's native share sheet when supported.
function saveOrShareCanvas(canvasElement, filename) {
  const dataURL = canvasElement.toDataURL('image/png');
  const base64 = dataURL.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'image/png' });
  const file = new File([blob], filename, { type: 'image/png' });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    // Invoke share immediately within the original tap gesture.
    navigator.share({ files: [file], title: 'My Day Photobooth' })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Native share failed:', error);
          openImageForSaving(blob);
        }
      });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Keep the URL alive longer for mobile browsers that process downloads slowly.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function openImageForSaving(blob) {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, '_blank');
  if (!opened) alert('Your browser blocked the image tab. Please allow pop-ups, then tap Download again.');
  setTimeout(() => URL.revokeObjectURL(url), 120000);
}

downloadBtn.addEventListener('click', () => {
  if (!photoReady) return;
  try {
    drawCanvas(false);
    saveOrShareCanvas(canvas, 'myday-photobooth.png');
    drawCanvas();
  } catch (error) {
    drawCanvas();
    alert('Could not create your PNG. Please try again.');
    console.error('Photo download failed:', error);
  }
});

homeBtn.addEventListener('click', () => window.location.href = 'index.html');
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', () => window.location.href = 'index.html');
});