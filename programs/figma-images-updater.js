const VERBOSE = true

const BASE_URL = "https://api.github.com/repos/apify/apify-overseer/contents/screenshots/generated/app/"
const TOKEN = process.env.GITHUB_TOKEN_FIGMA;

// const images = await find(n => isImage(n) && n)
const images = await figma.currentPage.selection

for (const image of images) {
  const {name, removed, visible, locked, isMask, fills} = image
  print("📥", name, "Processing")
  if (removed || !visible || locked || isMask) {
    print("⏭", name, "Ignored: removed || !visible || locked || isMask")
    continue;
  }
  if (fills[0].type !== "IMAGE") {
    print("⏭", name, "Ignored: fills[0].type !== IMAGE")
    continue;
  }

  const encoded = encodeURIComponent(name)
  const url = `${BASE_URL}${encoded}.png?bump=${Math.random()}`
  VERBOSE && print(url)

  const loadedJson = await fetchJson(url, {
    headers: {
      Authorization: `token ${TOKEN}`,
    },

    cache: 'no-cache'
  });

  const downloadUrl = loadedJson.download_url;
  VERBOSE && print(downloadUrl)
  const loadedImage = await Img(downloadUrl).load();
  VERBOSE && print(loadedImage)

  if (!loadedImage.width) {
    print("⏭", name, "Ignored: Image not loaded (dimensions check failed)")
    continue;
  }

  print("⚙️", name, "Replacing")
  const createdImage = figma.createImage(loadedImage.data)
  const createdImageHash = createdImage.hash

  const oldPaint = fills[0]
  const newPaint = JSON.parse(JSON.stringify(oldPaint))
  newPaint.imageHash = createdImage.hash
  image.fills = [newPaint]
  print("✅️", name, "Replaced... waiting")
}
