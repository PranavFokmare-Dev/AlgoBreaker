const youtubePage = {
  homePage:
    "#page-manager > ytd-browse > ytd-two-column-browse-results-renderer",
  videoPlayerEndScreen:
    "#movie_player > div.html5-endscreen.ytp-player-content.videowall-endscreen.ytp-show-tiles > div",
  videoPlayerSideContent: "#items > ytd-item-section-renderer",
  search: "#page-manager > ytd-search",
};

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
      function: Hide,
      args: [youtubePage.homePage],
    });
  } else if (watchingYtVideo) {
    console.log("watching video", url);
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: Hide,
      args: [youtubePage.videoPlayerSideContent],
    });
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: Hide,
      args: [youtubePage.videoPlayerEndScreen],
    });
  } else if (userSearching) {
    console.log("user searching", url);
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: Show,
      args: [youtubePage.search],
    });
  }
}

function AlgoBreakerOff(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: Show,
    args: [youtubePage.homePage],
  });
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: Show,
    args: [youtubePage.search],
  });
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: Show,
    args: [youtubePage.videoPlayerEndScreen],
  });
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: Show,
    args: [youtubePage.videoPlayerSideContent],
  });
}

function Show(query) {
  const element = document.querySelector(query);
  console.log("SHOW CALLED", query);
  element.style.visibility = "visible";
}
function Hide(query) {
  const element = document.querySelector(query);
  console.log("HIDE CALLED,", query);
  element.style.visibility = "hidden";
}

function ShowHomePage() {
  const element = document.querySelector(youtubePage.homePage);
  element.style.visibility = "visible";
}

function ShowVideoPlayerEndScreen() {
  const element = document.querySelector(youtubePage.videoPlayerEndScreen);
  element.style.visibility = "visible";
}

function ShowVideoPlayerSideContent() {
  const element = document.querySelector(youtubePage.videoPlayerSideContent);
  element.style.visibility = "visible";
}

function ShowSearch() {
  const element = document.querySelector(youtubePage.search);
  element.style.visibility = "visible";
}

function HideHomePage() {
  const element = document.querySelector(youtubePage.homePage);
  element.style.visibility = "hidden";
}

function HideVideoPlayerEndScreen() {
  const element = document.querySelector(youtubePage.videoPlayerEndScreen);
  element.style.visibility = "hidden";
}

function HideVideoPlayerSideContent() {
  const element = document.querySelector(youtubePage.videoPlayerSideContent);
  element.style.visibility = "hidden";
}

function ShowSearch() {
  const element = document.querySelector(youtubePage.search);
  element.style.visibility = "visible";
}
