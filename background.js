chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ mode: "off" }, function () {});
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  AlgoBreakerMain(request.mode, request.tabId, request.tabUrl);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.storage.sync.get(["mode"], function (result) {
    const mode = result.mode;
    console.log(`THIS current mode ${mode} for ${tab.id} ${tab.url}`);
    AlgoBreakerMain(mode, tab.id, tab.url);
  });
});

function AlgoBreakerMain(mode, tabId, url) {
  console.log("current mode " + mode + " tabid:" + tabId + " url:" + url);
  if (mode === "on") AlgoBreakerOn(url, tabId);
  else AlgoBreakerOff(tabId);
}

function AlgoBreakerOn(url, tabId) {
  const isHomePage = url == "https://www.youtube.com/";
  const watchingYtVideo = url.startsWith("https://www.youtube.com/watch");
  const userSearching = url.startsWith(
    "https://www.youtube.com/results?search_query"
  );
  if (isHomePage) {
    console.log("home page", url);
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: hideRecommendationsOnHomePage,
    });
  } else if (watchingYtVideo) {
    console.log("watching video", url);
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: hideRecommendationsOnWatching,
    });
  } else if (userSearching) {
    console.log("user searching", url);
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: showRecommendationsOnSearch,
    });
  }
}

function AlgoBreakerOff(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: showRecommendationsOnHomePage,
  });
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: showRecommendationsOnWatching,
  });
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: showRecommendationsOnSearch,
  });
}

function hideRecommendationsOnHomePage() {
  const element = document.querySelector("#primary > ytd-rich-grid-renderer");
  element.style.visibility = "hidden";
}
function showRecommendationsOnHomePage() {
  const element = document.querySelector("#primary > ytd-rich-grid-renderer");
  element.style.visibility = "visible";
}
function showRecommendationsOnSearch() {
  const element = document.querySelector("#page-manager > ytd-search");
  element.style.visibility = "visible";
}
function hideRecommendationsOnWatching() {
  const element = document.querySelector(
    "#related > ytd-watch-next-secondary-results-renderer"
  );
  element.style.visibility = "hidden";
}
function showRecommendationsOnWatching() {
  const element = document.querySelector(
    "#related > ytd-watch-next-secondary-results-renderer"
  );
  element.style.visibility = "visible";
}
