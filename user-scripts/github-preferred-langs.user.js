// ==UserScript==
// @name         GitHub – preferred programming languages when browsing starred repositories
// @match        https://github.com/*?tab=repositories&type=source
// @match        https://github.com/*?tab=stars
// @grant        none
// ==/UserScript==
if (!window.location.search.includes("language")) {
  const currentUrl = new URL(window.location.href);
  [
    "javascript",
    "typescript",
  ].forEach(language => {
    currentUrl.searchParams.set("language", language)
    window.open(currentUrl.toString(), "_blank")
  })
}
