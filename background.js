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

chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.sync.set({ mode: "on" }, function () {});
  console.log("runtime on installed");
  await setInStorage({mode:"on"});
  await saveTabSessions({});
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



//Analytics code


const analyticsEnum = {
  currentTabId:"currentTabId",
  newTabUrl :"chrome://newtab/"
};
chrome.tabs.onActivated.addListener(
  async function(activeInfo){
    let tabId = activeInfo.tabId;
    let currentTabId = await getFromStorage("currentTabId");
    if(currentTabId != null && currentTabId !== undefined){
      endTabSession(currentTabId);
    }
    currentTabId = tabId;
    await setInStorage({currentTabId:tabId});
    const tabInfo = await getTabInfo(tabId);
    let tabSessions = await getTabSessions();
    tabSessions[tabId] = {
      url:"",
      startTime: 0,
      endTime :0
    };
    if(tabInfo.url !== analyticsEnum.newTabUrl){
      tabSessions[tabId] = {
        url:tabInfo.url,
        startTime:Date.now(),
        endTime:Date.now()
      };
    }
    await saveTabSessions(tabSessions);
  }
)


function endTabSession(tabId){
  // const tabSessions = await getTabSessions();
  // if(tabSessions[tabId] !== undefined)){
  //   const session = tabSessions[tabId];
  //   const timeSpent = getTimeSpent(session);
  //   await addToHistory(tab, timeSpent);
  //   session.startTime = 0;
  //   session.endTime = 0;
  //   await saveTabSessions(tabSessions);
  //   console.log(await getTabSessions());
  // }
  console.log(`ending ${tabId}`);
}

async function getTabSessions(){
  let tabSessions = await getFromStorage("tabSession");
  return (tabSessions === undefined)?{}:tabSessions;
}
async function saveTabSessions(map){
  await setInStorage({tabSessions: map});
}
function getTimeSpent(session){
  return session.endTime - session.startTime;
}

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
    console.log(`updated ${tabId}:${tab.url} - ${Date.now()}  `)
  }
})

function getFromStorage(key){
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function(result){
      const value = result[key];
      if(chrome.runtime.lastError){
        console.log("error occured"+chrome.runtime.error);
      }
      else{
        resolve(value);
      }
    })

  }); 
}


function setInStorage(data){
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(data, function() {
      resolve();
    });
    

  }); 
}

function getTabInfo(tabId){
  return new Promise((resolve, reject)=>{
    chrome.tabs.get(tabId,function(tab){
      resolve(tab);
    })
  });
}