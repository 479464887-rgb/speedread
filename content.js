// SpeedRead - Content Script
let overlay = null;
let isPlaying = false;
let words = [];
let currentIndex = 0;
let wpm = 400;
let timer = null;

// Listen for popup/command messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SPEEDREAD_SELECTION') {
    startSpeedRead();
    sendResponse({ success: true });
  }
  if (request.type === 'STOP') {
    destroy();
    sendResponse({ success: true });
  }
  if (request.type === 'SET_WPM') {
    wpm = request.wpm;
    sendResponse({ success: true });
  }
});

async function startSpeedRead(text) {
  // Use selected text or passed text
  const selectedText = text || window.getSelection()?.toString()?.trim();
  if (!selectedText || selectedText.length < 10) {
    alert('请先选中要速读的文字（至少10个字符）');
    return;
  }

  // Get settings
  let settings = {};
  try {
    const resp = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    settings = resp.settings || {};
  } catch (e) {}

  wpm = settings.wpm || 400;
  const fontSize = settings.fontSize || 42;

  // Tokenize: split by spaces for English, character-level for CJK
  const hasCJK = /[\u4e00-\u9fff\u3400-\u4dbf]/.test(selectedText);
  if (hasCJK) {
    // Chinese/Japanese: split into 2-4 char chunks
    words = [];
    const chars = selectedText.replace(/\s+/g, '').split('');
    let i = 0;
    while (i < chars.length) {
      const isPunct = /[，。！？、；：""''（）《》【】…—,\.!\?;:(){}[\]"']/.test(chars[i]);
      if (isPunct) {
        words.push(chars[i]);
        i++;
      } else {
        const chunkSize = Math.random() > 0.5 ? 2 : 3;
        words.push(chars.slice(i, i + chunkSize).join(''));
        i += chunkSize;
      }
    }
  } else {
    // English: split by whitespace
    words = selectedText.split(/\s+/).filter(w => w.length > 0);
  }

  if (words.length < 3) return;
  currentIndex = 0;

  // Create overlay
  destroy();
  overlay = document.createElement('div');
  overlay.id = 'speedread-overlay';
  overlay.innerHTML = `
    <div class="sr-backdrop"></div>
    <div class="sr-container">
      <div class="sr-word" style="font-size:${fontSize}px">${words[0]}</div>
      <div class="sr-controls">
        <div class="sr-progress-bar"><div class="sr-progress-fill"></div></div>
        <div class="sr-info">
          <span class="sr-counter">1 / ${words.length}</span>
          <span class="sr-wpm">${wpm} WPM</span>
        </div>
        <div class="sr-buttons">
          <button class="sr-btn" id="sr-slower">🐢</button>
          <button class="sr-btn sr-btn-play" id="sr-play">▶</button>
          <button class="sr-btn" id="sr-faster">🐇</button>
          <button class="sr-btn" id="sr-close">✕</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Event handlers
  overlay.querySelector('#sr-play').addEventListener('click', togglePlay);
  overlay.querySelector('#sr-slower').addEventListener('click', () => changeSpeed(-50));
  overlay.querySelector('#sr-faster').addEventListener('click', () => changeSpeed(50));
  overlay.querySelector('#sr-close').addEventListener('click', destroy);
  overlay.querySelector('.sr-backdrop').addEventListener('click', destroy);

  // Keyboard controls
  document.addEventListener('keydown', handleKeyboard);

  // Auto start
  play();
}

function play() {
  if (isPlaying) return;
  isPlaying = true;
  const btn = overlay?.querySelector('#sr-play');
  if (btn) btn.textContent = '⏸';

  const interval = 60000 / wpm; // ms per word
  tick();
  timer = setInterval(tick, interval);
}

function pause() {
  isPlaying = false;
  const btn = overlay?.querySelector('#sr-play');
  if (btn) btn.textContent = '▶';
  if (timer) { clearInterval(timer); timer = null; }
}

function togglePlay() {
  isPlaying ? pause() : play();
}

function tick() {
  if (currentIndex >= words.length) {
    pause();
    return;
  }

  const wordEl = overlay?.querySelector('.sr-word');
  const counterEl = overlay?.querySelector('.sr-counter');
  const progressEl = overlay?.querySelector('.sr-progress-fill');

  if (wordEl) {
    wordEl.textContent = words[currentIndex];
    wordEl.style.transform = 'scale(1.1)';
    setTimeout(() => wordEl.style.transform = 'scale(1)', 30);
  }
  if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${words.length}`;
  if (progressEl) progressEl.style.width = `${((currentIndex + 1) / words.length) * 100}%`;

  currentIndex++;
}

function changeSpeed(delta) {
  wpm = Math.max(100, Math.min(1200, wpm + delta));
  const wpmEl = overlay?.querySelector('.sr-wpm');
  if (wpmEl) wpmEl.textContent = `${wpm} WPM`;

  // Restart timer with new speed
  if (isPlaying) {
    if (timer) { clearInterval(timer); timer = null; }
    const interval = 60000 / wpm;
    timer = setInterval(tick, interval);
  }
}

function handleKeyboard(e) {
  if (!overlay) return;
  switch (e.key) {
    case ' ':
    case 'Spacebar':
      e.preventDefault();
      togglePlay();
      break;
    case 'Escape':
      destroy();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      currentIndex = Math.max(0, currentIndex - 5);
      break;
    case 'ArrowRight':
      e.preventDefault();
      currentIndex = Math.min(words.length - 1, currentIndex + 5);
      break;
  }
}

function destroy() {
  if (timer) { clearInterval(timer); timer = null; }
  isPlaying = false;
  document.removeEventListener('keydown', handleKeyboard);
  if (overlay) { overlay.remove(); overlay = null; }
}
