function injectScript (url) {
  return new Promise(function (resolve, reject) {
    const s = document.createElement("script")
    s.src = url
    s.async = true
    s.type = "text/javascript"
    s.onerror = reject
    s.onload = resolve
    document.body.appendChild(s)
  })
}
