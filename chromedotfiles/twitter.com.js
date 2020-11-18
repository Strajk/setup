var expressions = [
  // Politics
  // I care about politics, but not on Twitter
  "trump",
  "#Debates2020",
  "senate",
  "democrats",
  "republicans",
  // Politics - Czech
  "babiš",

  // FOMO
  "covid",

  // Drama
  "Zuckerberg",
  "protest",
]

// TODO: Optimize! Avoid rechecking all elements all the time

window.addEventListener("DOMNodeInserted", debounce(hide, 100, false), false)

function hide () {
  const containers = document.querySelectorAll("[role=article]")
  expressions.forEach(expression => {
    containers.forEach(container => {
      const tweets = container.querySelectorAll("div[lang]") // more tweets on retweets
      tweets.forEach(tweet => {
        const tweetText = tweet.textContent
        if (tweetText) {
          const regex = new RegExp(expression, "i")
          if (regex.test(tweetText)) {
            console.log("Hiding tweet '" + tweetText + "' because it matches expression '" + expression + "'")
            // tweetContainer.parentElement.removeChild(tweetContainer)
            container.parentElement.style.opacity = 0.3
            container.parentElement.style.outline = "1px dotted red"
          }
        }
      })
    })
  })
}

function debounce (func, wait, immediate) {
  let timeout
  return function () {
    var context = this; var args = arguments
    const later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}
