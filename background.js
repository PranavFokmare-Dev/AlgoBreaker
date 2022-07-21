const analyticsEnum = {
  NoTabSet : -1,
  newTabUrl :"chrome://newtab/",
  emptyUrl :"EMPTY_URL",
  historyRemoverAlarmName : "historyWeeklyRemover"
}
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

let currentTabId = -1;
const tabSessions = {};

chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.sync.set({ mode: "on" }, function () {});
  console.log("runtime on installed");
  await setInStorage({mode:"on"});
  await saveHistory({});
  const weekDurationInMins = 7 * 24* 60;
  chrome.alarms.create(analyticsEnum.historyRemoverAlarmName, {periodInMinutes:weekDurationInMins});
});

//Button click -> on/off call
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  AlgoBreakerMain(request.mode, request.tabId, request.tabUrl);

  console.log("SUMMARY");
  console.log(currentTabId);
  console.log(tabSessions);
  console.log(await getHistory());
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



chrome.tabs.onActivated.addListener(
    async function(activeInfo){
      console.log("Active" + activeInfo.tabId);
        let tabId = activeInfo.tabId;
        if(currentTabId !== analyticsEnum.NoTabSet){
            await endTabSession(currentTabId);
        }
      currentTabId = tabId;
      const isOldTab = tabSessions[tabId]!== undefined
      if(isOldTab){
        tabSessions[tabId].startTime = Date.now();
      }
      else{
        tabSessions[tabId] = {
          url:analyticsEnum.emptyUrl,
          startTime: 0,
          endTime :0
       };
      
      }
    }
   )
 chrome.tabs.onUpdated.addListener( async function (tabId, changeInfo, tab) {
  const notUpdatedToNewTab = tab.url!=analyticsEnum.newTabUrl 
  
  console.log("update" + tabId);
  if(notUpdatedToNewTab){

     if(tabSessions[tabId]!== undefined ){
      const linkUpdatedOnNewTab = tabSessions[tabId].url === analyticsEnum.emptyUrl
       if(linkUpdatedOnNewTab){
         tabSessions[tabId].url = getHostName(tab.url);
         tabSessions[tabId].startTime = Date.now();
       }
       else{
          //In current tab user changed the link
         if(tabId === currentTabId){
           await endTabSession(tabId); 
           tabSessions[tabId] = {url:getHostName(tab.url),startTime:Date.now(), endTime:0};
         }
       }
     }
     else{
      //middle click
      console.log("middle click");
      console.log(tab);
      tabSessions[tabId] = {url:getHostName(tab.url),startTime:0, endTime:0};
     }
   }
 })
async function endTabSession(tabId) {
  const session = tabSessions[tabId];
  const timeSpent = Date.now() - session.startTime;
  let history = await getHistory();
  if (history[session.url] === undefined) {
    history[session.url] = 0;
  }
  history[session.url] += Math.max(timeSpent, 0);
  session.startTime = 0;
  await saveHistory(history);
}

chrome.tabs.onRemoved.addListener(
 async function(tabId, removedInfo){
  
  console.log("closed" + tabId);
     if(tabSessions[tabId] !== undefined){
        if(tabId == currentTabId) await endTabSession(tabId);
        delete tabSessions[tabId]
     }
   }
 )

async function getHistory(){
  let history = await getFromStorage("history");
  return (history === undefined)?{}:history;
 }

async function saveHistory(history){
    await setInStorage({history:history});
}

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

function getHostName(url){
  const details = new URL(url);
  return details.hostname;
}


// history remover
chrome.alarms.onAlarm.addListener(
  async function(alarm){
    if(alarm.name === analyticsEnum.historyRemoverAlarmName){
      console.log("removing History");
      await saveHistory({});
    }
   
  }
)

