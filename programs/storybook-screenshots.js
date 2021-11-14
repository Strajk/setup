const playwright = require("playwright")

const BASE_URL = "http://localhost:6008" // ✏️ OVERRIDE THIS
const PATH = "?path=/story/actor-actorstore-item--paid-actor" // ✏️ OVERRIDE THIS WITH DESIRED COMPONENT PATH

let browser
let context
let page

const OPTIONS = { width: 1024, height: 1400 } // important only for fullpage components, "sized" components are automatically trimmed

async function main () {
  browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 2000,
    args: [
      `--window-size=${OPTIONS.width},${OPTIONS.height}`,
      "--hide-scrollbars", // TODO: Make it work, seems not to have effect
    ],
  })

  context = await browser.newContext({ viewport: { width: OPTIONS.width, height: OPTIONS.height } }) // TODO: Explain why this is needed
  page = await context.newPage()

  await page.goto(`${BASE_URL}/${PATH}`)
  await page.waitForSelector("#storybook-preview-iframe")
  await page.waitForTimeout(1000) // Just to be sure, browsers are not a nice place to assert anything

  // e.g. {
  //   "account-integrations--default":
  //     "id": "account-integrations--default",
  //     "kind": "Account/Integrations"
  //     "story": "Default",
  const stories = await page.evaluate(() => {
    return window.__STORYBOOK_ADDONS.channel.data.setStories[0].stories
  })

  // e.g. "account-integrations--default"
  const currentStory = await page.evaluate(() => {
    return window.__STORYBOOK_ADDONS.channel.data.storyRendered[0]
  }, [])

  const kind = stories[currentStory].kind
  const siblings = Object.values(stories).filter(x => x.kind === kind)
  await loop((await context.newPage()), siblings)

  browser.close()
}

async function loop (page, siblings) {
  for (const sibling of siblings) {
    console.log("📖 Story: " + sibling.id)
    await page.goto(`${BASE_URL}/iframe.html?id=${sibling.id}&viewMode=story`)
    await page.waitForTimeout(1000) // Just to be sure, browsers are not a nice place to assert anything
    await page.addStyleTag({ content: `
      body {
        overflow: hidden !important; /* Hide scrollbars */
      }
  ` })
    const canvas = await page.waitForSelector("#root")
    await canvas.screenshot({ path: `generated-screenshots/${sibling.id}.png` })
  }
}

async function screenshot (page, name) {
  console.log("📸 Screenshoting, smile!: " + name)
  const iframe = await page.waitForSelector("#storybook-preview-iframe")
  const iframeContent = await iframe.contentFrame()
  const canvas = await iframeContent.waitForSelector("#root")
  await canvas.screenshot({ path: `generated-screenshots/${name}.png` })
}

main()
