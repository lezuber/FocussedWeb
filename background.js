// INIT
// ___________________________________________________________________________________
let isSiteAllowed = true;
var myBlockedURLs, isEnabled, isWhitelistMode;

myBlockedURLs = [];
isEnabled = false;
isWhitelistMode = false;

var initializeExtension = function () {
  console.log("Starting Up!");
  chrome.storage.sync.get("urlStore", function (results) {
    if (results.urlStore === undefined) {
      console.log("urlStore is undefined, using defaults");
      var defaultURLs = [
        "www.youtube.com",
        "www.facebook.com",
        "news.ycombinator.com",
      ];

      var newStorage = { urlStore: defaultURLs };
      newStorage.isEnabled = false;
      newStorage.isWhitelist = false;

      chrome.storage.sync.set(newStorage, function () {});
    } else {
      console.log("urlStore is defined");
      updateBlockedList();
    }
  });
};

// Methods
// ___________________________________________________________________________________

var updateBlockedList = function () {
  console.log("Refresh for Blocked List!");
  myBlockedURLs = [];
  chrome.storage.sync.get("urlStore", function (results) {
    results.urlStore.forEach((url) =>
      myBlockedURLs.push(url.replace(/https?:\/\/(?:www\.)?/g, ""))
    );
  });
};

var checkIfUrlAllowed = function (reqUrl) {
  let isSiteAllowed = true;

  let urlsToCheck = [...myBlockedURLs];

  if (isWhitelistMode) {
    urlsToCheck.push("SiteBlocked.html");
  }

  urlsToCheck.forEach((url) => {
    if (reqUrl.indexOf(url) != -1) {
      console.log("Triggered!");
      isSiteAllowed = false;
      return;
    }
  });

  return isWhitelistMode ? !isSiteAllowed : isSiteAllowed;
};

// ___________________________________________________________________________________
// MAIN

chrome.extension.onRequest.addListener(function (request, _, _) {
  if (request.msg == "updateBlockedList") updateBlockedList();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (isEnabled && changeInfo.status === "loading") {
    if (tab.url && !checkIfUrlAllowed(tab.url)) {
      console.log("Redirect!");
      chrome.tabs.update(tab.id, { url: "SiteBlocked.html" });
    }
    return;
  }
});

chrome.runtime.onMessage.addListener(function (request, _, _) {
  if (request["isActive"]) {
    console.log("Focus - Toggled On");
    isEnabled = true;
  } else if (request["isActive"] != undefined && !request["isActive"]) {
    console.log("Focus - Toggled Off");
    isEnabled = false;
  } else if (request["isWhitelist"]) {
    console.log("Focus - Whitelist-Mode Activated");
    isWhitelistMode = true;
  } else if (request["isWhitelist"] != undefined && !request["isWhitelist"]) {
    console.log("Focus - Whitelist-Mode Deactivated!");
    isWhitelistMode = false;
  }
});

initializeExtension();
