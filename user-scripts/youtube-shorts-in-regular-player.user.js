// ==UserScript==
// @name         YouTube Shorts In regular player
// @match        *://*.youtube.com/*
// @grant        none
// ==/UserScript==

const { location } = window

function replaceShortsUrl () {
  if (location.pathname.startsWith("/shorts/")) location.replace(location.pathname.replace("/shorts/", "/watch?v="))
}

document.addEventListener("yt-navigate-start", replaceShortsUrl)
replaceShortsUrl()
