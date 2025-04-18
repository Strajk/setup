// ==UserScript==
// @name         Google Account Selector
// @version      1.1
// @description  Enhances Google account selection with keyboard shortcuts for faster authentication
// @author       strajk@me.com
// @match        https://accounts.google.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
// Note: Cannot just match /o/oauth2/auth/oauthchooseaccount and /signin/oauth/v2/consentsummary cause google does some weird navigation shit
// Demo https://share.cleanshot.com/RZW7wxyM

let debugEnabled = true
let debug = debugEnabled
  ? (...args) => console.log("[AuthHelper]", ...args)
  : () => { }

(function () {
  const ALLOWED_PATHS = [
    "/_/bscframe", // weird pathname that shows on `o/oauth2/auth/oauthchooseaccount`
    "/signin/oauth/id",
    "/o/oauth2/auth",
    "/signin/oauth/consent", // real pathname when on signin/oauth/v2/consentsummary = selecting what to authorize
    "/o/oauth2/auth/oauthchooseaccount",
    "/signin/oauth/v2/consentsummary",
    "/o/oauth2/v2/auth",
  ]

  if (!ALLOWED_PATHS.includes(window.location.pathname)) {
    debug("Invalid pathname:", window.location.pathname)
    return
  }

  debug("Auth helper loaded")

  function highlightButton (el) {
    if (!el) return
    el.style.outline = "5px solid #4CAF50"
    el.style.outlineOffset = "2px"
  }

  function createHelpMessage () {
    const helpDiv = document.createElement("div")
    helpDiv.style.position = "fixed"
    helpDiv.style.bottom = "20px"
    helpDiv.style.right = "20px"
    helpDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
    helpDiv.style.color = "white"
    helpDiv.style.padding = "10px 15px"
    helpDiv.style.borderRadius = "5px"
    helpDiv.style.fontFamily = "Arial, sans-serif"
    helpDiv.style.fontSize = "14px"
    helpDiv.style.zIndex = "9999"
    helpDiv.id = "auth-helper-message"
    return helpDiv
  }

  const matchers = [
    // Continue has precedence over email, as on "Selecting access" page there's a both email selector and continue button
    ["button", (el) => el.textContent.toLowerCase() === "continue"],
    "[data-email]",
    "[data-identifier*=\"@\"]",
  ]

  let checkInterval = setInterval(() => {
    let matchedElements = []
    let currentIndex = 0

    for (const matcher of matchers) {
      if (typeof matcher === "string") {
        const elements = document.querySelectorAll(matcher)
        if (elements.length > 0) {
          matchedElements = Array.from(elements)
          break
        }
      } else {
        const [selector, filterFn] = matcher
        const elements = document.querySelectorAll(selector)
        const filtered = Array.from(elements).filter(filterFn)
        if (filtered.length > 0) {
          matchedElements = filtered
          break
        }
      }
    }

    if (matchedElements.length > 0) {
      debug(`Found ${matchedElements.length} matching elements`)
      clearInterval(checkInterval)

      // Highlight the first element
      highlightButton(matchedElements[currentIndex])

      // Create and display help message
      const helpDiv = createHelpMessage()
      if (matchedElements.length > 1) {
        helpDiv.textContent = "AuthHelper: Press ⌘+Enter to continue, or use ↑↓ arrows to select different accounts"
      } else {
        helpDiv.textContent = "AuthHelper: Press ⌘+Enter to continue"
      }
      document.body.appendChild(helpDiv)

      document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.metaKey) {
          debug("cmd+enter pressed")
          matchedElements[currentIndex].click()
        } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          // Remove highlight from current element
          matchedElements[currentIndex].style.outline = ""
          matchedElements[currentIndex].style.outlineOffset = ""

          // Move to next element
          currentIndex = (currentIndex + 1) % matchedElements.length

          // Highlight new current element
          highlightButton(matchedElements[currentIndex])
          debug(`Selected element ${currentIndex + 1} of ${matchedElements.length}`)
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          // Remove highlight from current element
          matchedElements[currentIndex].style.outline = ""
          matchedElements[currentIndex].style.outlineOffset = ""

          // Move to previous element
          currentIndex = (currentIndex - 1 + matchedElements.length) % matchedElements.length

          // Highlight new current element
          highlightButton(matchedElements[currentIndex])
          debug(`Selected element ${currentIndex + 1} of ${matchedElements.length}`)
        }
      })
    } else {
      debug("No element found")
    }
  }, 1000)
})()
