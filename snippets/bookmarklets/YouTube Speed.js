// https://news.ycombinator.com/item?id=23449538

/*
CTRL+[ Decrease Speed
CTRL+] Increase Speed
CTRL+\ Set Increment Unit
CTRL+' Set Speed to Specific Rate
CTRL+; Reset Playback to Default
*/

(function () {
  (function () {
    var rateUnit = 0.2
    var osdTimeout = 3000
    var eleOSD, osdTimer

    function showOSD (rate) {
      if (eleOSD) {
        eleOSD.textContent = rate + "X"
      } else {
        eleOSD = document.createElement("DIV")
        eleOSD.style.cssText = "position:fixed;z-index:999999999;right:5px;bottom:5px;margin:0;padding:5px;width:auto;height:auto;font:bold 10pt/normal monospace;background:#444;color:#fff"
        eleOSD.textContent = rate + "X"
        document.body.appendChild(eleOSD)
      }
      clearTimeout(osdTimer)
      osdTimer = setTimeout(function () {
        eleOSD.remove()
        eleOSD = null
      }, osdTimeout)
    }

    addEventListener("keydown", function (ev) {
      var ele = document.querySelector("VIDEO"); var rate; var inp
      if (ele && ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
        rate = rate = ele.playbackRate
        switch (ev.key) {
          case "[":
            rate -= rateUnit
            if (rate < 0.1) rate = 0.1
            break
          case "]":
            rate += rateUnit
            if (rate > 16) rate = 16
            break
          case "\\":
            if ((inp = prompt("Enter playback rate increment/decrement unit.", rateUnit)) === null) return
            if (isNaN(inp = parseFloat(inp.trim())) || (inp <= 0) || (inp > 4)) {
              alert("Number must be greater than zero, and less or equal to 4.")
              return
            }
            rateUnit = inp
            return
          case "'":
            if ((inp = prompt("Enter playback rate.\n(1.0 = Normal)", rate)) === null) return
            if (isNaN(inp = parseFloat(inp.trim())) || (inp < 0.1) || (inp > 16)) {
              alert("Number must be between 0.1 to 16 (inclusive).")
              return
            }
            rate = inp
            break
          case ";":
            rate = 1
            break
          default:
            return
        }
        rate = parseFloat(rate.toFixed(2))
        ele.playbackRate = rate
        if (osdTimeout > 0) showOSD(ele.playbackRate)
      }
    })
  })()
})()
