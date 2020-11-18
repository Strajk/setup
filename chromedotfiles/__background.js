/* eslint-env webextensions */

chrome.webRequest.onBeforeRequest.addListener(
  page => {
    if (page.type === "main_frame") { // don't block api requests
      const url = new URL(page.url)
      if (shouldBlock(url)) {
        console.log("Page blocked", page.url)
        return { cancel: true }
      }
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"],
)

function shouldBlock (url) {
  if (url.hostname === "www.facebook.com") {
    if (url.pathname) { if (url.pathname === "/groups/503237783037580") return false }
    return true
  }

  if (url.hostname === "www.instagram.com") {
    if (url.pathname === "/direct/inbox/") return false
    return true
  }

  if (url.hostname === "twitter.com") {
    if (url.pathname === "/") return true
    if (url.pathname === "/home") return true
    return false
  }

  // News – homepage
  if ([
    "www.idnes.cz",
    "ihned.cz",
    "www.seznamzpravy.cz",
  ].includes(url.hostname) && url.pathname === "/") return true

  // Reddit – whitelist subbredits
  if (url.hostname === "www.reddit.com") {
    if (url.pathname.startsWith("/message")) return false
    if (url.pathname.startsWith("/user")) return false
    if ([
      "/r/frontend/",
      "/r/gadgets/",
      "/r/javascript/",
      "/r/mac/",
      "/r/node/",
      "/r/programming/",
      "/r/strava/",
      "/r/technology/",
      "/r/typescript/",
      "/r/webdev/",
      "/r/webscraping/",
    ].some(x => url.pathname.startsWith(x))) return false
    return true
  }
}
