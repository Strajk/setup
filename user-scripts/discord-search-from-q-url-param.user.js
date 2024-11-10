// ==UserScript==
// @name        Discord: Use "q" search param for Discord search
// @match       https://discord.com/channels/*
// @grant       none
// @version     1.0
// @author      strajk.me
// ==/UserScript==

const DEBUG = false
const log = (...args) => { if (DEBUG) console.log("[q-search-param-userscript]", ...args) }

setTimeout(() => {
  const inputSelector = "[aria-label=Search][contenteditable]"
  let once = false
  log("Timeout fired, starting interval...")
  const interval = setInterval(async () => {
    const inputEl = document.querySelector(inputSelector)
    log("Checking for input element...", inputEl)
    if (!inputEl) return
    // await new Promise(r => setTimeout(r, 500))
    // Parse the "q" param from the query string
    const urlObj = new URL(window.location.href)
    const q = urlObj.searchParams.get("q")

    if (!q) {
      log("No q param found in URL, exiting...")
      return clearInterval(interval)
    }

    if (once) {
      return clearInterval(interval)
    } else {
      once = true
    }

    log("Setting input value to", q)

    const textEvent = document.createEvent("TextEvent")
    // https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ff975867(v=vs.85)
    // @ts-ignore
    textEvent.initTextEvent(
      "textInput", // eventType
      true, // canBubble
      true, // cancelable
      null, // viewArg
      q, // dataArg
      undefined, // inputMethod
      undefined, // locale
    )
    inputEl.dispatchEvent(textEvent)
    // trigger `this.handleBeforeInput = e`

    await wait(250)

    // Simulate pressing enter on that input
    console.log("Simulating Enter keypress")
    inputEl.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", keyCode: 13, which: 13, bubbles: true }))
    // trigger `this.search = e`

    clearInterval(interval)
  }, 1000)
}, 1000)

async function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
