/* eslint-env webextensions */

// Loaded with https://github.com/Strajk/chromedotfilez

/* Disable links while holding ⌘+⌥ */
/* === */
// chrome.runtime.onMessage.addListener(
//   function (request, sender, sendResponse) {
//     if (request.event === "keyDown") {
//       chrome.tabs.insertCSS({ code: "a { pointer-events: none; background: red; } " })
//     } else if (request.event === "keyUp") {
//       chrome.tabs.insertCSS({ code: "a { pointer-events: all } " })
//     }
//   },
// )

/* Blocking */
/* === */
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
    // Allow Twitter for now, block just specific keywords
    // if (url.pathname === "/") return true
    // if (url.pathname === "/home") return true
    return false
  }

  // News – homepage
  if ([
    "www.idnes.cz",
    "ihned.cz",
    "www.seznamzpravy.cz",
  ].includes(url.hostname) && url.pathname === "/") return true

  // Reddit – whitelist subbredits
  if (false && url.hostname === "www.reddit.com") { // temp disabled
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

/*Neat URL*/
/*===*/
// browser.webRequest.onBeforeRequest.addListener(
//   cleanURL,
//   { urls: ["<all_urls>"], types: ["main_frame"] },
// )
//   ["blocking"],

// function cleanURL(details) {
//   let url = new URL(details.url)
//   let domain = url.hostname
//   let originalDetailsUrl = details.url
//
//   // Do not change links for these domains
//   for (let blackDomain of []) { // TODO
//     if (domain.endsWith(blackDomain)) return
//   }
//
//   domain = domain.replace(/^www\./i, "") // do not consider www. as subdomain
//   let rootDomain = getRootDomain(domain)
//   let domainMinusSuffix = getDomainMinusSuffix(domain)
//
//   if (domain == null || rootDomain == null || domainMinusSuffix == null) {
//     return
//   }
//
//   let blockedParams = []
//   let hashParams = []
//   let endingParams = []
//   let excludeParams = []
//
//   let defaultBlockedParamsWithoutOverrides = neat_url_default_blocked_params.filter((defaultBlockedParam) => !neat_url_override_default_blocked_params.includes(defaultBlockedParam))
//   let allBlockedParams = defaultBlockedParamsWithoutOverrides.concat(neat_url_blocked_params)
//
//   for (let gbp of allBlockedParams) {
//     let match = getParameterForDomainUrl(gbp, domain, rootDomain, domainMinusSuffix, url)
//     if (match === "") continue
//
//     // Hash params
//     if (match.startsWith("#")) {
//       if (neat_url_logging) console.log(`[Neat URL]: hash param '${match}' matches (for domain)`)
//       hashParams.push(match)
//       continue
//     }
//
//     // Ending params
//     if (match.startsWith("$")) {
//       if (neat_url_logging) console.log(`[Neat URL]: ending param '${match}' matches (for domain)`)
//       endingParams.push(match)
//       continue
//     }
//
//     // Excludes
//     if (match.startsWith("!")) {
//       if (neat_url_logging) console.log(`[Neat URL]: exclude param '${match}' matches (for domain)`)
//       excludeParams.push(match)
//       continue
//     }
//
//     blockedParams.push(match)
//   }
//
//   for (let excludeParam of excludeParams) {
//     blockedParams = removeFromArray(blockedParams, excludeParam.replace("!", ""))
//   }
//
//   //! ?a=1&a=2 is valid
//   // keys must be removed in reverse,
//   // because, when first is removed, third is moved to second position
//   let forparams = new URL(url)// or... make copy
//   for (let key of forparams.searchParams.keys()) {
//     // console.log(`[Neat URL]: if includes(${key})`)
//     if (blockedParams.includes(key)) {
//       // console.log(`[Neat URL]: delete(${key})`)
//       url.searchParams.delete(key)
//     }
//   }
//
//   // <https://github.com/Smile4ever/firefoxaddons/issues/30> should no longer occur with the new buildURL function
//   // <https://github.com/Smile4ever/firefoxaddons/issues/47> should be solved as well
//   leanURL = buildURL(url, blockedParams, hashParams)
//   leanURL = removeEndings(leanURL, endingParams)
//
//   // Is the URL changed?
//   if (new URL(originalDetailsUrl).href == leanURL.href) return
//
//   if (neat_url_logging) console.log(`[Neat URL]: (type ${details.type}): '${originalDetailsUrl}' has been changed to '${leanURL}'`)
//
//   const applyAfter = 1000
//
//   if (leanURL.hostname != "addons.mozilla.org") {
//     animateToolbarIcon()
//     if (neat_url_show_counter) incrementBadgeValue(details.tabId)
//   } else {
//     // webRequest blocking is not supported on mozilla.org, lets fix this
//     // but only if we are navigating to addons.mozilla.org and there doesn't exist a tab yet with the same URL
//     if (details.type != "main_frame") return
//     if (globalNeatURL == leanURL.href) return
//
//     globalNeatURL = leanURL.href
//     globalCurrentURL = originalDetailsUrl
//     globalTabId = details.tabId
//
//     setTimeout(function () {
//       browser.tabs.query({ url: globalCurrentURL }).then((tabs) => {
//         if (globalNeatURL == null || globalNeatURL == "") return
//
//         if (tabs.length == 0) {
//           // console.log(`[Neat URL]: the query for '${globalCurrentURL}' returned nothing. Attempting '${globalNeatURL}'`);
//         } else {
//           // console.log(`[Neat URL]: It was opened in a new tab, update that tab to '${globalNeatURL}'`);
//
//           for (tab of tabs) {
//             if (neat_url_logging) console.log(`[Neat URL]: really updating '${tab.url}' to '${globalNeatURL}'`)
//             browser.tabs.update(tab.id, { url: globalNeatURL })// May be fired more than once?
//             animateToolbarIcon()
//             if (neat_url_show_counter) incrementBadgeValue(globalTabId)
//           }
//         }
//
//         setTimeout(() => {
//           globalNeatURL = ""
//           globalCurrentURL = ""
//         }, applyAfter)
//       }, null)
//     }, applyAfter)
//   }
//
//   return { redirectUrl: leanURL.href }
// }
