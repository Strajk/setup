var sites = {
  "impact.meteor.com": {
    selectors: [".video-container"],
  },
  "www.stream.cz": {
    selectors: ["#player"],
  },
  "www.youtube.com": {
    selectors: [".html5-main-video"],
  },
  "egghead.io": {
    selectors: [".wistia_embed", "#video-container object"],
  },
  "www.joyent.com": {
    selectors: [".vimeo-video"],
  },
  "frontendmasters.com": {
    selectors: [".video-element .target"],
  },
  "max.adobe.com": {
    selectors: ["iframe"],
  },
  "vimeo.com": {
    selectors: [".js-player"],
  },
  "www.atozcss.com": {
    selectors: [".episode-video"],
  },
  "www.pluralsight.com": {
    offset: {
      top: 50,
      bottom: -30,
    },
    selectors: ["#video"],
  },
  "www.ustream.tv": {
    selectors: ["#EmbedViewer"],
  },
  "www.ceskatelevize.cz": {
    selectors: ["#programmePlayer"],
  },
  "app.pluralsight.com": {
    selectors: ["#video"],
  },
}

var videoEl

var needles
if (sites[window.document.location.host]) {
  needles = sites[window.document.location.host].selectors
} else {
  needles = [".wistia_embed", "video"]
}

needles.every(function(needle) {
  var el = document.querySelector(needle)
  if (el) {
    videoEl = el
    console.log("Video element found")
    return false // break loop
  }
  return true // continue searching
})

var bounds = videoEl.getBoundingClientRect()
console.log("Bounds", bounds)
var viewportHeight = Math.max(
  document.documentElement.clientHeight,
  window.innerHeight || 0,
)
var toolbarHeight = window.screen.height - viewportHeight // Window has to be fullscreen height
console.log("toolbarHeight", toolbarHeight)

var result = {
  left: bounds.left,
  top: bounds.top + toolbarHeight,
  width: bounds.width,
  height: bounds.height,
}

console.log("Result", result)

// Process offsets
if (
  sites[window.document.location.host] &&
  sites[window.document.location.host].offset
) {
  // Shorthand
  var offset = sites[window.document.location.host].offset

  if (offset.left) result.left = result.left - offset.left
  if (offset.top) result.top = result.top - offset.top
  if (offset.right) result.width = result.width + offset.right
  if (offset.bottom) result.height = result.height + offset.bottom
}

var output =
  result.left + "," + result.top + "," + result.width + "," + result.height

// eslint-disable-next-line no-unused-expressions
output
