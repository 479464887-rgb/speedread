// SpeedRead - Popup
document.addEventListener('DOMContentLoaded', async () => {
  // Load settings
  const { settings } = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
  const wpm = settings?.wpm || 400;

  const slider = document.getElementById('wpm-slider');
  const display = document.getElementById('wpm-val');
  slider.value = wpm;
  display.textContent = wpm;

  slider.addEventListener('input', () => {
    display.textContent = slider.value;
  });

  // Presets
  document.querySelectorAll('.preset').forEach(p => {
    p.addEventListener('click', () => {
      slider.value = p.dataset.wpm;
      display.textContent = p.dataset.wpm;
    });
  });

  // Start speed read
  document.getElementById('btn-start').addEventListener('click', async () => {
    const currentWpm = parseInt(slider.value);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Update WPM in content script
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, { type: 'SET_WPM', wpm: currentWpm });
      await chrome.tabs.sendMessage(tab.id, { type: 'SPEEDREAD_SELECTION' });
    }
    window.close();
  });

  // Settings
  document.getElementById('btn-settings').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});
