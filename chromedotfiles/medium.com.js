/* TODO: Nicer */
function injectJs (what) {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script")

    if (what.startsWith("//")) { // Only for local development, CWS disallows remote code
      el.src = what
    } else {
      el.textContent = what
    }

    el.onerror = reject
    el.onload = resolve

    document.head.appendChild(el)
  })
}

(async () => {
  const ID = "__INJECTED_BY_DOTJS__"
  await injectJs("//cdn.jsdelivr.net/npm/mousetrap@1.6.5/mousetrap.min.js")
  if (!document.getElementById(ID)) {
    const script = document.createElement("script")
    script.setAttribute("id", ID)
    script.text = `(${main.toString()})();`
    document.documentElement.appendChild(script)
  }
})()

function main () {
  function simulateClick (node) {
    var md = document.createEvent("MouseEvents")
    md.initEvent("mousedown", true, false)
    node.dispatchEvent(md)
    var mu = document.createEvent("MouseEvents")
    mu.initEvent("mouseup", true, false)
    node.dispatchEvent(mu)
  }

  window.Mousetrap.bind([
    "x c",
  ], (ev) => {
    // thank god for aria
    var claps = document.querySelector("[aria-label='clap'][width='33']").parentNode
    var clapCount = 0
    var clapper = setInterval(function () {
      if (clapCount < 50) {
        simulateClick(claps)
        clapCount++
      } else {
        clearInterval(clapper)
      }
    }, 10)
  })
}
