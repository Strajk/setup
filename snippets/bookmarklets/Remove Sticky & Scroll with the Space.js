// https://news.ycombinator.com/item?id=23445382

(function () {
  let i
  const elements = document.querySelectorAll("body *")
  for (i = 0; i < elements.length; i++) {
    if (
      getComputedStyle(elements[i]).position === "fixed" ||
      getComputedStyle(elements[i]).position === "sticky"
    ) {
      elements[i].parentNode.removeChild(elements[i])
    }
  }

  const elem = Array.from(document.getElementsByTagName("body"))[0].appendChild(document.createElement("div")) // wut??
  elem.style.width = "100%"
  elem.style.borderTop = "1px solid red"
  elem.style.position = "absolute"
  elem.style.top = "0px"
  elem.style.opacity = "0"
  elem.style.transition = "opacity 1000ms"
  window.addEventListener("keydown", e => {
    if (e.code === "Space") {
      elem.style.transition = ""
      elem.style.top =
        (window.innerHeight + window.scrollY) + "px"
      elem.style.opacity = "1"
      setTimeout(function () {
        elem.style.transition = "opacity 1000ms"
        elem.style.opacity = "0"
      }, 200)
    }
  })
}())
