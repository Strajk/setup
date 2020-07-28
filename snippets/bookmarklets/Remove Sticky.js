// https://news.ycombinator.com/item?id=23445382
// Or use https://arantius.com/misc/greasemonkey/fixed-only-at-top.user.js

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
})()
