// ExtPay - Payment integration
importScripts('ExtPay.js');
const extpay = ExtPay('speedread');
extpay.startBackground();

// SpeedRead - Background Service Worker
const DEFAULTS = {
  wpm: 400,
  fontSize: 42,
  showProgress: true,
  theme: 'dark'
};

chrome.runtime.onInstalled.addListener(async () => {
  const { settings } = await chrome.storage.sync.get('settings');
  if (!settings) await chrome.storage.sync.set({ settings: DEFAULTS });
});

// Keyboard shortcut handler
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'start-speedread') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'SPEEDREAD_SELECTION' });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_SETTINGS':
      chrome.storage.sync.get('settings').then(sendResponse);
      return true;
  case 'GET_PAID_STATUS':
    extpay.getUser().then(sendResponse);
    return true;
  case 'OPEN_PAYMENT':
    extpay.openPaymentPage();
    sendResponse({ success: true });
    return false;
  case 'OPEN_LOGIN':
    extpay.openLoginPage();
    sendResponse({ success: true });
    return false;

    case 'SAVE_SETTINGS':
      chrome.storage.sync.set({ settings: request.settings }).then(() => sendResponse({ success: true }));
      return true;
  }
});
