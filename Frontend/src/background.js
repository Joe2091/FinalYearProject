console.log('Background script running...');
//Chrome Extension Sending Notification
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
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
// Allows for the extension to be opened as window on right click
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'openPopupWindow',
    title: 'Open NoteMAX as Window',
    contexts: ['action'],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'openPopupWindow') {
    chrome.windows.create({
      url: 'popup.html',
      type: 'popup',
      width: 600,
      height: 600,
    });
  }
});
