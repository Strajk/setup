(() => {
  const ID = "__INJECTED_BY_DOTJS__"
  if (!document.getElementById(ID)) {
    const script = document.createElement("script")
    script.setAttribute("id", ID)
    script.text = `(${main.toString()})();`
    document.documentElement.appendChild(script)
  }
})()

function main () {
  if (false && window.location.pathname === "/watch") { // TODO: debug & enable
    let activeComment

    // .activity without id would match also group activity, just [id^="Activity-"] would match comment threads
    // :visible will omit activities hidden by other features on this extensions (eg. virtual rides)
    const selector = "ytd-comment-renderer"
    const container = document.querySelector("#tab-comments")
    const setActiveEntry = (el) => {
      if (activeComment) activeComment.style.boxShadow = "none"
      activeComment = el
      activeComment.style.boxShadow = "-1px 0px 0px 0px #cc0202"
      // native `scrollIntoView` not possible due to header with fixed position
      const absoluteOffset = activeComment.offsetTop // Cannot use .offsetTop as that is relative to it's positioned parent, not whole window
      container.scroll(0, absoluteOffset - (55 + 10)) // 55 ~ header height, 10 - padding
    }

    window.document.addEventListener("keydown", function (ev) {
      if (
        document.activeElement && (
          document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA" ||
          document.activeElement.isContentEditable // not needed atm, but future proof
        )
      ) return true // Do not handle

      if ([";", "'"].includes(ev.key)) {
        ev.preventDefault()
        if (!activeComment) {
          const firstVisible = Array.from(document.querySelectorAll(selector)).find(x => x.offsetTop > container.scrollTop)
          setActiveEntry(firstVisible)
        } else {
          const all = Array.from(document.querySelectorAll(selector))
          const currentIndex = all.indexOf(activeComment)
          if (
            (ev.key === "'" && currentIndex === 0) || // first, cannot go up
            (ev.key === ";" && currentIndex === (all.length - 1)) // last, cannot go down
          ) return false
          const target = all[currentIndex + (ev.key === ";" ? 1 : -1)]
          if (!target) return console.error("Next active element not found (this should not happen)", { all, currentIndex })
          setActiveEntry(target)
        }
      }

      if (activeComment && ev.key === "\\") {
        ev.preventDefault()
        activeComment.querySelector("#like-button").click()
      }
    })
  }
}
