const youtubePage = {
  homePage:
    "#page-manager > ytd-browse > ytd-two-column-browse-results-renderer",
  videoPlayerEndScreen:
    "#movie_player > div.html5-endscreen.ytp-player-content.videowall-endscreen.ytp-show-tiles > div",
  videoPlayerSideContent: "#items > ytd-item-section-renderer",
  search: "#page-manager > ytd-search",
  playlistSideContent :"#related"
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
  const hideCss = `${youtubePage.homePage}{visibility:hidden}
${youtubePage.videoPlayerEndScreen}{visibility:hidden}
${youtubePage.videoPlayerSideContent}{visibility:hidden}
${youtubePage.playlistSideContent}{visibility:hidden}
`;
  console.log(hideCss);
  // adding if url starts with
  // adding show css if the url doesnt starts with
  chrome.scripting.insertCSS(
    {
      target: { tabId: tabId },
      css: hideCss,
    },
    () => {}
  );
}

function AlgoBreakerOff(tabId) {
  const showCss = `${youtubePage.homePage}{visibility:visible}
  ${youtubePage.videoPlayerEndScreen}{visibility:visible}
  ${youtubePage.videoPlayerSideContent}{visibility:visible}
  ${youtubePage.playlistSideContent}{visibility:visible}
  `;
  console.log(showCss);
  chrome.scripting.insertCSS(
    {
      target: { tabId: tabId },
      css: showCss,
    },
    () => {}
  );
}
