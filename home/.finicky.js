/*
* https://github.com/johnste/finicky
*
* Feature requests:
* * Firefox container support https://github.com/johnste/finicky/issues/211
*
*
* QUICK REFERENCE:
*
* Browser syntax:
* browser: "Google Chrome"
* browser: "com.google.Chrome"
* browser: "/Applications/Google Chrome.app"
* browser: { name: "Google Chrome", profile: "Default" }
*
* Chrome profiles match directory structure in `~/Library/Application Support/Google/Chrome`
*/

module.exports = {
  defaultBrowser: "Browserosaurus", // (☞ ͡° ͜ʖ ͡°ˋ)☞ https://github.com/will-stone/browserosaurus
  options: {
    // See more https://github.com/johnste/finicky/wiki/Configuration
    // logRequests: true,
    hideIcon: false,
  },
  rewrite: [
    {
      match: ({ url, opener }) => {
        return url.protocol === "https"
          && url.host.includes('notion.so')
          && opener.bundleId === "com.tinyspeck.slackmacgap"
      },
      url: ({ url }) => ({ ...url, protocol: "notion" })
    },
  ],
  handlers: [
    {
      match: finicky.matchHostnames([
        "127.0.0.1",
        "localhost",
        "sentry.io",
        "gitlab.com",
        "github.com",
        "logdna.com",
        "newrelic.com",
      ]),
      browser: "Google Chrome Canary" // Live dangerously
    },
    {
      match: ["https://www.google.com/search?*"],
      browser: "Google Chrome" // I depend ony my Chrome extensions to use Google
    },
    {
      match: ["soundcloud.com/*", "mixcloud.com/*"], // No specific reason not to use matchHostnames, just wanted to show off
      browser: "Safari" // Better support for native audio
    },
    {
      match: ["https://docs.google.com/spreadsheets/d/*/edit?usp=drivesdk"], // `drivesdk` -> usually from Alfred workflow
      browser: "Firefox" // No extensions to make Google apps work faster
    },
    {
      match: () => finicky.getKeys().command && !finicky.getKeys().shift,
      browser: 'Google Chrome'
    },
    {
      match: () => finicky.getKeys().command && finicky.getKeys().shift,
      browser: 'Brave Browser' // (⌐■_■)
    },
    {
      // Open any link clicked in Slack in Safari
      match: ({ opener }) => opener.bundleId === "com.tinyspeck.slackmacgap",
      browser: "Safari"
    },

    // Other examples
    // {
    // Open any link clicked in Slack in Safari
    // match: ({ opener }) => opener.bundleId === "com.tinyspeck.slackmacgap",
    // browser: "Safari"
    // },
  ]
}
