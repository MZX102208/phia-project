import awaitNetworkIdle from "./utils/networkIdle";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getCookie") {
    chrome.cookies.get({ url: message.url, name: message.cookieName }, (cookie) => {
      sendResponse({ value: cookie ? cookie.value : undefined });
    });
    return true;
  }
  if (message.type === "awaitNetworkIdle") {
    awaitNetworkIdle(sender.tab.id).then(() => {
      sendResponse();
    });
    return true;
  }
});
