chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "readAloudSelection",
    title: "Read Aloud Selected Text",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "toggleReadAloudUI",
    title: "Show Read Aloud UI",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readAloudSelection") {
    if (info.selectionText) {
      chrome.tabs.sendMessage(tab.id, {
        action: "readAloud",
        text: info.selectionText,
      });
    }
  } else if (info.menuItemId === "toggleReadAloudUI") {
    chrome.tabs.sendMessage(tab.id, {
      action: "toggleUI",
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, {
    action: "toggleUI",
  });
});
