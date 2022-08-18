// ==UserScript==
// @name         Google Meet – preferred user
// @match        https://meet.google.com/*
// @grant        none
// ==/UserScript==

const preferredUser = 1 // for a lot of people, 0 is personal, 1 is work

if (
  !window.location.href.includes("authuser")
) {
  window.location.href += window.location.href.includes("?") ? "&" : `?authuser=${preferredUser}`
}
