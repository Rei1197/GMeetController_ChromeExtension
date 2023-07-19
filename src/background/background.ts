console.log('this is working from background.ts')


chrome.runtime.onInstalled.addListener(() => {
  // loadModel();

  // Create the context menu
  chrome.contextMenus.create({
    id: "startDetecting",
    title: "Start Detection on Google",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "stopDetecting",
    title: "Stop Detection on Google",
    contexts: ["all"],
  });

});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'startDetecting') {
    chrome.tabs.sendMessage(tab.id, { type: 'startDetecting' });
  } else if (info.menuItemId === 'stopDetecting') {
    chrome.tabs.sendMessage(tab.id, { type: 'stopDetecting' });
  }
});
// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "logMeetVideoStream" && tab) {
    chrome.tabs.sendMessage(tab.id, { type: "logMeetVideoStream"});
  }
});

//------------------- cam conbine like this -------------------------

// chrome.contextMenus.onClicked.addListener((info, tab) => {
//   if (info.menuItemId === 'startDetecting') {
//     chrome.tabs.sendMessage(tab.id, { type: 'startDetecting' });
//   } else if (info.menuItemId === 'stopDetecting') {
//     chrome.tabs.sendMessage(tab.id, { type: 'stopDetecting' });
//   } else if (info.menuItemId === 'logMeetVideoStream') {
//     chrome.tabs.sendMessage(tab.id, { type: 'logMeetVideoStream' });
//   }
// });