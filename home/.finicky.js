/*
* Config file for https://github.com/johnste/finicky
* My setup described in natural language:
* - Brave Browser as my default browser, because it supports manifest v2 extensions, which I refuse to give up
* - Google Chrome Dev as my development browser, best dev tools
* - Google Chrome reserved for automation tasks, like Playwright, Cursor, etc. I'll not use it directly so the whole browser can be safely killed when needed
* - Firefox dedicated for my work Google account
* - Firefox Developer Edition - not used
* - Opera - used with pinned tabs for AI, cause of free VPN
* - Safari - used for SoundCloud, YouTube Music etc, cause it's most memory efficient
*
* QUICK REFERENCE:
* Various Browser syntax:
*   browser: "Google Chrome"
*   browser: "com.google.Chrome"
*   browser: "/Applications/Google Chrome.app"
*   browser: { name: "Google Chrome", profile: "Default" }
*
* Chrome profiles match directory structure in `~/Library/Application Support/Google/Chrome`
* 
* Feature requests:
* * Firefox container support https://github.com/johnste/finicky/issues/211
*/

export default {
  defaultBrowser: "Brave Browser",
  options: {
    // See more https://github.com/johnste/finicky/wiki/Configuration
    // logRequests: true,
    hideIcon: false,
  },
  // rewrite: [
  //   {
  //     // In Slack, open Notion links in the Notion app, not in the browser
  //     match: ({ url, opener }) => {
  //       return url.protocol === "https"
  //         && url.host.includes('notion.so')
  //         && opener.bundleId === "com.tinyspeck.slackmacgap"
  //     },
  //     url: ({ url }) => ({ ...url, protocol: "notion" })
  //   },
  // ],
  rewrite: [
    {
      // Open links from Opera in Chrome
      // This does only work with custom extension in Opera rewriting the URLs to finicky:// protocol
      // https://github.com/johnste/finicky/issues/224
      // https://github.com/johnste/finicky/discussions/319
      // https://apps.apple.com/us/app/stopthemadness/id1376402589?mt=12
      // https://apps.apple.com/us/app/stopthemadness-pro/id6471380298
      match: (url, { opener }) => opener.bundleId === "com.operasoftware.Opera",
      url: (url) => {
        // Not sure if best practice, but it works
        return new URL(url.href.replace("finicky://", "https://"))        
      },
      browser: "Brave Browser"
    },
  ],
  handlers: [
    {
      match: finicky.matchHostnames([
        "127.0.0.1",
        "localhost",
        // "sentry.io",
        // "newrelic.com",
      ]),
      browser: "Google Chrome Dev"
    },
    {
      match: ["soundcloud.com/*", "mixcloud.com/*"],
      browser: "Safari"
    },
    {
      match: [
        "https://kiwicom.atlassian.net/wiki/*",
        "https://gitlab.skypicker.com/*",
      ],
      browser: "Firefox"
    },

    // For testing Atlassian Sandbox
    // {
    //   match: [
    //     "https://kiwicom-sandbox-414.atlassian.net/*",
    //     "https://kiwicom.atlassian.net/*",
    //   ],
    //   url: ({ url }) => {
    //     return {
    //       ...url,
    //       protocol: "https",
    //       host: url.host.replace("kiwicom.atlassian.net", "kiwicom-sandbox-414.atlassian.net")
    //     }
    //   },
    //   browser: "Firefox"
    // },

    // Special cases
    // {
    //   match: () => finicky.getKeys().command && !finicky.getKeys().shift,
    //   browser: 'Google Chrome'
    // },
    // {
    //   match: () => finicky.getKeys().command && finicky.getKeys().shift,
    //   browser: 'Brave Browser' // (⌐■_■)
    // }
  ]
}
