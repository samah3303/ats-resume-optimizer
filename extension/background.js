/**
 * paniund 1-Click Job Clipper — Background Service Worker (Manifest V3)
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("paniund 1-Click Job Clipper installed.");
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SET_BADGE") {
    chrome.action.setBadgeText({ text: message.text || "" });
    chrome.action.setBadgeBackgroundColor({ color: message.color || "#0A8A00" });
    if (message.clearAfterMs) {
      setTimeout(() => {
        chrome.action.setBadgeText({ text: "" });
      }, message.clearAfterMs);
    }
    sendResponse({ success: true });
  }
  return true;
});
