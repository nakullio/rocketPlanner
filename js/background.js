let actionItemsUtils = new ActionItems();

// create the context menu
chrome.contextMenus.create({
  id: "linkSiteMenu",
  title: "Link site for later",
  contexts: ["all"],
});

// use chrome.runtime.onInstalled function to avoid error on actionItems
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason == "install") {
    console.log("On Installed");
    chrome.storage.sync.set({
      // set action items in Chrome Storage to an array []
      actionItems: [],
    });
  }
});

// capture the Context Menu click using contectMenus.onClicked.addListener
chrome.contextMenus.onClicked.addListener((info, tab) => {
  //   check the context menu
  if (info.menuItemId == "linkSiteMenu") {
    actionItemsUtils.addQuickActionItem(
      "quick-action-2",
      "Read this site",
      tab,
      () => {
        // after we completed adding the site on action item list, then set the progress , for badge update
        actionItemsUtils.setProgress();
      }
    );
  }
});
