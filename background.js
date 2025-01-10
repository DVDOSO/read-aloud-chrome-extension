// context menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "readAloudContextMenu",
        title: "Read Aloud Selected Text",
        contexts: ["selection"]
    });
});

// handle click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "readAloudContextMenu") {
      // info.selectionText contains the selected text
      if (info.selectionText) {
        // Send a message to content script to read the selected text
        chrome.tabs.sendMessage(tab.id, {
          action: "readAloud",
          text: info.selectionText
        });
      }
    }
  });