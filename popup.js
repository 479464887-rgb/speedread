// ==================== ExtPay Integration ====================
let extpay;
try {
  extpay = ExtPay('speedread');
  
  extpay.getUser().then(user => {
    if (user && user.paid) {
      document.body.classList.add('pro-user');
      const badge = document.querySelector('.pro-badge');
      if (badge) badge.style.display = 'inline-block';
    } else {
      document.body.classList.add('free-user');
    }
  }).catch(e => console.error('ExtPay: getUser failed', e));
  
  window.openUpgrade = () => {
    try { extpay.openPaymentPage(); }
    catch(e) { console.error('ExtPay: payment failed', e); }
  };
  window.openLogin = () => {
    try { extpay.openLoginPage(); }
    catch(e) { console.error('ExtPay: login failed', e); }
  };
} catch(e) {
  console.error('speedread: ExtPay init failed', e);
}

let words = [], index = 0, playing = false, interval = null;
const display = document.getElementById('word-display');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const speedInput = document.getElementById('speed');
const wpmLabel = document.getElementById('wpm-label');
const textInput = document.getElementById('text-input');

speedInput.addEventListener('input', () => {
  wpmLabel.textContent = speedInput.value + ' WPM';
  if (playing) { clearInterval(interval); startInterval(); }
});

playBtn.addEventListener('click', () => {
  if (!playing) {
    words = textInput.value.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return;
    if (index >= words.length) index = 0;
    playing = true;
    playBtn.textContent = '⏸ Pause';
    showWord();
    startInterval();
  } else {
    playing = false;
    playBtn.textContent = '▶ Play';
    clearInterval(interval);
  }
});

pauseBtn.addEventListener('click', () => {
  playing = false;
  playBtn.textContent = '▶ Play';
  clearInterval(interval);
});

resetBtn.addEventListener('click', () => {
  playing = false;
  clearInterval(interval);
  index = 0;
  playBtn.textContent = '▶ Play';
  display.innerHTML = '<span class="word">Ready</span>';
});

function startInterval() {
  clearInterval(interval);
  interval = setInterval(() => {
    if (index >= words.length) { playing = false; clearInterval(interval); playBtn.textContent = '▶ Play'; return; }
    showWord();
    index++;
  }, 60000 / parseInt(speedInput.value));
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showWord() {
  const word = words[index];
  const pivot = Math.floor(word.length / 2);
  const prefix = word.substring(0, pivot);
  const focus = word.charAt(pivot);
  const suffix = word.substring(pivot + 1);
  display.innerHTML = `<span class="word">${escapeHtml(prefix)}<span class="focus-letter">${escapeHtml(focus)}</span>${escapeHtml(suffix)}</span>`;
}
