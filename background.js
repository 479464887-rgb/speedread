// ExtPay initialization
try {
  const extpay = ExtPay('speedread');
  extpay.startBackground();
} catch(e) {
  console.error('speedread: ExtPay init failed', e);
}

chrome.runtime.onInstalled.addListener(() => console.log('SpeedRead ready'));
