chrome.webRequest.onBeforeRequest.addListener(
  page => {
    console.log("Page blocked", page.url)
    return { cancel: true }
  },
  {
    // https://developer.chrome.com/extensions/match_patterns
    // *://*.example.com matches
    // - all subdomains (www.example.com)
    // - and also root domain (example.com)
    urls: [
      "*://*.facebook.com/*",
      "*://*.twitter.com/*",
      "*://*.instagram.com/*",

      "*://*.youtube.com/", // block just homepage

      // block just homepages
      "*://*.idnes.cz/",
      "*://*.ihned.cz/",
      "*://*.seznamzpravy.cz/",

      // TODO: Allow some subreddits
      "*://www.reddit.com/*",
    ],
  },
  ["blocking"],
)

// TODO: Consider following style for better control
// chrome.webRequest.onBeforeRequest.addListener(
//   details => ({cancel: details.url.indexOf("://www.evil.com/") != -1}),
//   {urls: ["<all_urls>"]},
//   ["blocking"]
// );
