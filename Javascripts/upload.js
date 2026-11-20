// Upload three separate photos, one for each photo-strip slot.
const WIDTH = 1176;
const HEIGHT = 2940;
const SLOT_X = 60;
const SLOT_Y = [60, 888, 1716];
const SLOT_WIDTH = 1056;
const SLOT_HEIGHT = 768;
const TARGET_ASPECT = SLOT_WIDTH / SLOT_HEIGHT;

const elements = {
  canvas: document.getElementById('finalCanvas'),
  uploadInput: document.getElementById('uploadPhotoInput'),
  uploadBtn: document.getElementById('uploadPhoto'),
  readyBtn: document.getElementById('readyButton'),
  status: document.getElementById('uploadStatus')
};

const ctx = elements.canvas.getContext('2d');
let photoStage = 0;
let isLoading = false;

// Start with a clean strip whenever the upload page is opened.
localStorage.removeItem('photoStrip');

elements.canvas.width = WIDTH;
elements.canvas.height = HEIGHT;
ctx.clearRect(0, 0, WIDTH, HEIGHT);

function updateUploadStatus() {
  if (photoStage < 3) {
    elements.status.textContent = `Photo ${photoStage + 1} of 3 — ready to upload`;
    elements.uploadBtn.textContent = `Upload Photo ${photoStage + 1}/3`;
  }
}

// Crop an image to fill one slot without stretching it.
function drawPhoto(img, slotIndex) {
  const imageAspect = img.width / img.height;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (imageAspect > TARGET_ASPECT) {
    sw = img.height * TARGET_ASPECT;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / TARGET_ASPECT;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(
    img,
    sx, sy, sw, sh,
    SLOT_X, SLOT_Y[slotIndex], SLOT_WIDTH, SLOT_HEIGHT
  );
}

function finalizePhotoStrip() {
  const frame = new Image();

  frame.onload = () => {
    ctx.drawImage(frame, 0, 0, WIDTH, HEIGHT);
    elements.status.textContent = 'Your photo strip is ready! Add some stickers ♡';
    elements.uploadBtn.style.display = 'none';
    elements.readyBtn.style.display = 'inline-block';
    elements.readyBtn.disabled = false;
  };

  frame.onerror = () => {
    isLoading = false;
    elements.status.textContent = 'Could not load the photo frame. Please refresh and try again.';
  };

  frame.src = 'Assets/fish-photobooth/camerapage/frame.png';
}

elements.uploadBtn.addEventListener('click', () => {
  if (photoStage >= 3 || isLoading) return;
  elements.uploadInput.click();
});

elements.uploadInput.addEventListener('change', event => {
  const file = event.target.files && event.target.files[0];
  if (!file || photoStage >= 3 || isLoading) return;

  if (!file.type.startsWith('image/')) {
    elements.status.textContent = 'Please choose an image file.';
    elements.uploadInput.value = '';
    return;
  }

  isLoading = true;
  elements.status.textContent = `Loading photo ${photoStage + 1}...`;

  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    drawPhoto(img, photoStage);
    photoStage += 1;
    URL.revokeObjectURL(objectUrl);
    elements.uploadInput.value = '';
    isLoading = false;

    if (photoStage === 3) {
      elements.status.textContent = 'All 3 photos uploaded. Preparing your strip...';
      elements.uploadBtn.disabled = true;
      finalizePhotoStrip();
    } else {
      updateUploadStatus();
    }
  };

  img.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    elements.uploadInput.value = '';
    isLoading = false;
    elements.status.textContent = 'Could not read that photo. Please choose another one.';
  };

  img.src = objectUrl;
});

elements.readyBtn.addEventListener('click', () => {
  if (photoStage !== 3 || elements.readyBtn.disabled) return;

  try {
    localStorage.setItem('photoStrip', elements.canvas.toDataURL('image/jpeg', 0.85));
    window.location.href = 'final.html';
  } catch (error) {
    console.error('Could not save photo strip:', error);
    elements.status.textContent = 'Your photo strip is too large to continue. Please try smaller photos.';
  }
});

// Logo returns to the homepage.
const logo = document.querySelector('.logo');
if (logo) {
  logo.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

updateUploadStatus();