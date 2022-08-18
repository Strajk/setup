// Automatic redirect on https://www.google.com/url?q=https://target.com
if (window.location.pathname === "/url") {
  const search = new URLSearchParams(window.location.search)
  const url = search.get("q")
  window.location.href = url
}
