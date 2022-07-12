const webPage = {
  homePage:
    "#primary > ytd-rich-grid-renderer",
  videoPlayerEndScreen:
    "#movie_player > div.html5-endscreen.ytp-player-content.videowall-endscreen.ytp-show-tiles",
  videoPlayerSideContent: "#items > ytd-item-section-renderer",
  search: "#page-manager > ytd-search",
  playlistSideContent :"#items > ytd-item-section-renderer",
  videoPlayerSideContent2:"#secondary",
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ mode: "on" }, function () {});
});

//Button click -> on/off call
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  AlgoBreakerMain(request.mode, request.tabId, request.tabUrl);
});

//Change in URL|tab created changed url
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.storage.sync.get(["mode"], function (result) {
    const mode = result.mode;
    AlgoBreakerMain(mode, tab.id, tab.url);
  });
});
chrome.tabs.onActivated.addListener(
  function(activeInfo){
    let tabId = activeInfo.tabId;
    chrome.tabs.get(tabId,function(tab){
      console.log(`Active ${tabId}:${tab.url} - ${Date.now()}.`)
    })
  }
)
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
    console.log(`updated ${tabId}:${tab.url} - ${Date.now()}  `)
  }
})



function AlgoBreakerMain(mode, tabId, url) {
  if (mode === "on") AlgoBreakerOn(url, tabId);
  else AlgoBreakerOff(tabId);
}

function AlgoBreakerOn(url, tabId) {
  const hideCss = `${webPage.homePage}{visibility:hidden}
${webPage.videoPlayerEndScreen}{visibility:hidden}
${webPage.videoPlayerSideContent}{visibility:hidden}
${webPage.playlistSideContent}{visibility:hidden}
${webPage.videoPlayerSideContent2}{visibility:hidden}
${webPage.amazonPrimeAutoPlay2}{visibility:hidden}
`;
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
  const showCss = `${webPage.homePage}{visibility:visible}
  ${webPage.videoPlayerEndScreen}{visibility:visible}
  ${webPage.videoPlayerSideContent}{visibility:visible}
  ${webPage.playlistSideContent}{visibility:visible}
  ${webPage.videoPlayerSideContent2}{visibility:visible}
  ${webPage.amazonPrimeAutoPlay2}{visibility:visible}
  `;
  chrome.scripting.insertCSS(
    {
      target: { tabId: tabId },
      css: showCss,
    },
    () => {}
  );
}
