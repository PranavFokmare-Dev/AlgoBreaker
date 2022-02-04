let button = document.getElementById("changeColor");

button.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.storage.sync.get(["mode"], function (result) {
    const mode = result.mode;
    const changedMode = mode === "on" ? "off" : "on";
    button.innerHTML = `Turn it ${mode}`;
    chrome.storage.sync.set({ mode: changedMode }, function () {
      chrome.runtime.sendMessage(
        { tabId: tab.id, tabUrl: tab.url, mode: changedMode },
        function (response) {}
      );
    });
  });
});

function getURL() {}
