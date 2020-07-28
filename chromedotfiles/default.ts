// Facebook
if (window.location.hostname.endsWith("facebook.com")) {
  if (window.location.pathname === "/") { // Homepage
    (document.querySelector("#contentArea") as HTMLElement).style.display = "none"
  }
}

// Instagram
if (window.location.hostname.endsWith("instagram.com")) {
  if (window.location.pathname === "/") { // Homepage
    (document.querySelector("[role='main']") as HTMLElement).style.display = "none"
  }
}

// Twitter
if (window.location.hostname.endsWith("twitter.com")) {
  if (window.location.pathname === "/home") { // Homepage
    (document.querySelector("[role='main']") as HTMLElement).style.display = "none"
  }
}
