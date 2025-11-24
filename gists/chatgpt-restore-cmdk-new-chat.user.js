// ==UserScript==
// @name         ChatGPT: Restore cmd+k shortcut for new chat
// @description  Restore cmd+k shortcut for new chat, new history search is now cmd+shift+k
// @version      0.1
// @author       strajk@me.com
// @match        https://chatgpt.com/*
// @match        https://grok.com/*
// @match        https://www.perplexity.ai/*
// @match        https://claude.ai/*
// @match        https://gemini.google.com/*
// @match        https://aistudio.google.com/*
// @grant        none
// ==/UserScript==

// cmd+k » new chat
// cmd+shift+k » new chat in new tab

// should work for:
// https://chatgpt.com
// https://grok.com
// https://www.perplexity.ai
// https://claude.ai
// https://gemini.google.com
// https://aistudio.google.com

(function () {
  // ChatGPT recently changed keyboard shortcut to open new chat
  // from cmd + K to cmd + shift + O
  // let's remap it back! And allow the new cmd + K work with Shift
  document.addEventListener("keydown", (event) => {
    if (event.metaKey && event.key === "k") {
      if (event.shiftKey) {
        // cmd+shift+k » new chat in new tab
        console.log("CMD+SHIFT+K caught, opening new tab with current hostname")
        event.preventDefault()
        event.stopPropagation()
        window.open(`https://${window.location.hostname}`, "_blank")
      } else {
        // cmd+k » new chat in current tab

        // on chatgpt.com:
        if (window.location.hostname === "chatgpt.com") {
          console.log("CMD+K caught, cancelling default and triggering CMD+SHIFT+O")
          // Stop the default behavior...
          event.preventDefault()
          event.stopPropagation()
          // ...and trigger "cmd +shift + o" instead
          // eslint-disable-next-line no-undef
          document.dispatchEvent(new KeyboardEvent("keydown", {
            key: "o",
            shiftKey: true,
            metaKey: true,
          }))
        } else if (window.location.hostname === "gemini.google.com") {
          event.preventDefault()
          event.stopPropagation()
          // just go to https://gemini.google.com/app
          window.location.href = "https://gemini.google.com/app"
        } else if (window.location.hostname === "aistudio.google.com") {
          event.preventDefault()
          event.stopPropagation()
          // just go to https://aistudio.google.com/prompts/new_chat
          window.location.href = "https://aistudio.google.com/prompts/new_chat"
        }
      }
    }
  }, { capture: true })
}())
