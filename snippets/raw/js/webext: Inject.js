const s = document.createElement("script")
s.src = chrome.runtime.getURL("load.js")
s.type = "text/javascript"
document.body.appendChild(s)
