// ==UserScript==
// @name         GitHub color-code
// @match        https://github.com/*
// @require      https://raw.githubusercontent.com/bgrins/TinyColor/master/tinycolor.js
// @credits      gist~jjspace~df4fc6eaa587f70e60985977205e0787
// ==/UserScript==

const DEBUG = false
const maybeLog = (...args) => { if (DEBUG) console.log(...args) }

function textToPseudorandomRgb (inputString) {
  let hash = 0
  for (let i = 0; i < inputString.length; i++) hash = inputString.charCodeAt(i) + ((hash << 5) - hash)

  const c = (hash & 0x00FFFFFF)
    .toString(16)
    .toUpperCase()

  return "00000".substring(0, 6 - c.length) + c
}

/**
 * @param {HTMLElement} element
 * @param {Array<string>} [bgColors] the background colors to ensure readability
 */
function colorElement (element, bgColors = ["#000"], { asTextDecoration = false, subTextMatch } = {}) {
  if (!element) return maybeLog("colorElement: element not found", element)

  let text = element.innerText
  if (subTextMatch) text = text.match(subTextMatch)?.[0] ?? ""

  // check if a color is readable on read and unread backgrounds
  const isGoodColor = (color) => {
    const guideline = { level: "AA", size: "small" }
    const isGood = bgColors.reduce((acc, bgColor) => {
      return acc && tinycolor.isReadable(color, bgColor, guideline)
    }, true)
    // log('isGood', isGood);
    return isGood
  }

  const color = textToPseudorandomRgb(text)
  let readableColor = tinycolor(color)

  let times = 0
  const maxTimes = 10
  while (!isGoodColor(readableColor) && times < maxTimes) {
    readableColor = readableColor.lighten().desaturate()
    times++
  }

  // Some elements aren't sized nicely for the border bottom style so utilize the text decoration instead
  if (!asTextDecoration) {
    element.style.borderBottom = `1px solid #${readableColor.toHex()}`
  } else {
    element.style.textDecoration = `underline #${readableColor.toHex()}`
    // create a little extra spacing to make it easier to see the color highlight and match how it would look if it was the border method
    element.style.textUnderlineOffset = "2px"
  }
}

const updateOnMutate = (target, cb, ignoreMutation = (mutationTarget) => false) => {
  cb()

  const mutationCallback = (mutationsList, observer) => {
    maybeLog("mutation Triggered", target.className)
    mutationsList.forEach(mutation => {
      // only react to a change on the whole list
      if (ignoreMutation(mutation.target)) return
      if (mutation.type === "childList") {
        maybeLog("childlist mutation", mutation)
        cb()
      } else if (mutation.type === "subtree") {
        maybeLog("subtree mutation")
      }
    })
  }

  const observer = new MutationObserver(mutationCallback)
  observer.observe(target, { childList: true, subtree: true })
  maybeLog("observer listening", target.className)
}

const colorizeUsers = () => {
  document.querySelectorAll(".opened-by a").forEach(elem => {
    colorElement(elem, ["#0D1117"])
  })
}

function spanify (containerElem, searchTerm) {
  if (containerElem.querySelectorAll("span[data-colorize]").length > 0) {
    // TODO: add better detection as maybe we want different terms highlighted we've already spanified this elem
    return
  }
  containerElem.innerHTML = containerElem.innerHTML.replace(searchTerm, `<span data-colorize>${searchTerm}</span>`)
}

function colorizeNotifPage () {
  maybeLog("colorizeNotifPage called")
  // access and extract the repo data
  const sourceSelector = ".js-navigation-item [id^=notification] p.f6"
  // const sourcePattern = /(?<user>\w+)\/(?<repo>[\w-]+) #(?<id>\d+)/; // old that includes id number
  // username regex https://github.com/shinnn/github-username-regex
  const sourcePattern = /(?<user>[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})\/(?<repo>[\w\-\.]+)/i

  document.querySelectorAll(sourceSelector).forEach(notifSource => {
    try {
      const source = notifSource.innerText

      const match = source.match(sourcePattern)
      if (!match) {
        maybeLog("no user/repo combo found", source)
        return
      }
      const { user, repo, id } = match.groups

      // wrap repo name in span if it's not already
      if (!notifSource.querySelector("span.color-gh-repo")) {
        // notifSource.innerHTML = notifSource.innerHTML.replace(repo, `<span>${repo}</span>`);
        // we need to replace the LAST occurance of the repo name in case the org and repo are the same
        const lastIndex = notifSource.innerHTML.lastIndexOf(repo)
        const replacement = `<span class="color-gh-repo">${repo}</span>`
        notifSource.innerHTML =
          notifSource.innerHTML.substring(0, lastIndex) +
          replacement +
          notifSource.innerHTML.substring(lastIndex + repo.length + 1)
      } else {
        // if it was already put in a span,
        // it should have already been colorized
        return
      }

      const readBg = "#0D1117"
      const unreadBg = "#161B22"

      const repoSpan = notifSource.querySelector("span.color-gh-repo")
      colorElement(repoSpan, [readBg, unreadBg], { asTextDecoration: true })
    } catch (err) {
      console.error("colorize error", err)
    }
  })

  // access and extract sidebar repo list for a color key
  const sidebarSelector = ".js-notification-sidebar-repositories .filter-list a"

  document.querySelectorAll(sidebarSelector).forEach(repoLink => {
    try {
      const repoText = repoLink.innerText
      if (!repoText) {
        maybeLog("no repotext", repoLink)
        return
      }

      const match = repoText.match(sourcePattern)
      if (!match) {
        maybeLog("no user/repo combo found", repoText)
        return
      }
      const { user, repo } = match.groups

      // wrap repo name in span if it's not already - There is already one span in here for the Number of notifs
      if (!repoLink.querySelector("span.color-gh-repo")) {
        // we need to replace the LAST occurance of the repo name in case the org and repo are the same
        const lastIndex = repoLink.innerHTML.lastIndexOf(repo)
        const replacement = `<span class="color-gh-repo">${repo}</span>`
        repoLink.innerHTML =
          repoLink.innerHTML.substring(0, lastIndex) +
          replacement +
          repoLink.innerHTML.substring(lastIndex + repo.length + 1)
        maybeLog(`set span around sidebar repo ${repo}`)
      } else {
        // if it was already put in a span,
        // it should have already been colorized
        return
      }

      const readBg = "#0D1117"
      const unreadBg = "#161B22"

      const repoSpan = repoLink.querySelector("span.color-gh-repo")
      colorElement(repoSpan, [readBg, unreadBg], { asTextDecoration: true })
    } catch (err) {
      console.error("colorize error", err)
    }
  })

  const notifTypeSelector = ".AvatarStack + span"
  document.querySelectorAll(notifTypeSelector).forEach(notifTypeSpan => {
    const readBg = "#0D1117"
    const unreadBg = "#161B22"

    colorElement(notifTypeSpan, [readBg, unreadBg], { asTextDecoration: true })
  })
}

function colorizeCards () {
  maybeLog("styling project board")
  const cardUserSelector = "article.issue-card .js-project-issue-details-container .js-issue-number ~ a"
  document.querySelectorAll(cardUserSelector).forEach(elem => {
    colorElement(elem, ["#161b22"])
  })
  // these are the "Added by ..." wrapper cards
  document.querySelectorAll(".mr-4 small a").forEach(elem => {
    colorElement(elem, ["#161b22"])
  })
}

function colorizeRepoNames () {
  const repoSelector = "[data-hovercard-type=repository]" // <-- this makes it really easy but could break in the future
  document.querySelectorAll(repoSelector).forEach(repoLink => {
    const repoText = repoLink.innerText

    const sourcePattern = /(?<user>[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})\/(?<repo>[\w\-\.]+)/i
    const { user, repo } = repoText.match(sourcePattern).groups

    // wrap repo name in span if it's not already - There is already one span in here for the Number of notifs
    if (repoLink.querySelectorAll("span").length < 1) {
      // we need to replace the LAST occurance of the repo name in case the org and repo are the same
      const lastIndex = repoLink.innerHTML.lastIndexOf(repo)
      const replacement = `<span class="color-gh-repo">${repo}</span>`
      repoLink.innerHTML =
        repoLink.innerHTML.substring(0, lastIndex) +
        replacement +
        repoLink.innerHTML.substring(lastIndex + repo.length + 1)
      maybeLog(`set span around sidebar repo ${repo}`)
    } else {
      // if it was already put in a span,
      // it should have already been colorized
      return
    }

    const readBg = "#0D1117"
    const unreadBg = "#161B22"

    const repoSpan = repoLink.querySelector("span.color-gh-repo")
    colorElement(repoSpan, [readBg, unreadBg])
  })
}

function colorIssuesOrPulls () {
  // recheck inside mutate handler for when page changes
  const { pathname } = window.location
  if (pathname.includes("issues") || pathname.includes("pulls")) {
    colorizeUsers()
  }
}

function colorUserMentions () {
  document.querySelectorAll(":is(.timeline-comment, .review-comment) .user-mention").forEach(elem => {
    const userName = elem.innerText.substr(1) // strip off the `@` symbol
    spanify(elem, userName)
    colorElement(elem.querySelector("span[data-colorize]"), ["#22272e"], { asTextDecoration: true })
  })
}

function colorForPage () {
  const { pathname } = window.location
  if (pathname.includes("notifications")) {
    colorizeNotifPage()
  } else if (pathname.includes("projects")) {
    colorizeCards()
  } else if (pathname === "/pulls" || pathname === "/issues") {
    colorizeRepoNames()
  } else {
    colorIssuesOrPulls()
    if (document.querySelector(".notifications-list-item")) colorizeNotifPage()
    colorUserMentions()
  }
}

updateOnMutate(document.querySelector("html"), colorForPage)
window.addEventListener("pushstate", () => colorForPage())
window.addEventListener("popstate", () => colorForPage())
