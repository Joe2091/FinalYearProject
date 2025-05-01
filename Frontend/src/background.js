console.log('Background script running...');
//Chrome Extension Sending Notification
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'show-notification') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'clock.png',
      title: 'Reminder!',
      message: message.message,
      priority: 2,
    });
  }
});
