const fs = require("fs")
const path = require("path")
const glob = require("glob")
const chalk = require("chalk")
const mkdirp = require("mkdirp")
const imageType = require("image-type")
const axios = require("axios")

// TODO: Just for testing right now
const docFullPath = "/Users/strajk/Projects/strajk.me-next/pages/notes/2021/meteor-impact.md"

const docDirname = path.dirname(docFullPath) // `/Users/strajk/Projects/strajk.me/pages/notes/2021`
const docBasename = path.basename(docFullPath, ".md") // `strajkexpo`
const outputDir = path.resolve(docDirname, docBasename)
mkdirp.sync(outputDir) // TODO: Fail if exists
const outputAssetsDir = path.resolve(outputDir, "assets")
mkdirp.sync(outputAssetsDir)// TODO: Fail if exists

const pattern = /!\[.*\]\((.+)\)/g;

(async () => {
  console.log(chalk.gray("Processing: ") + chalk.blue(docFullPath))
  const contentOriginal = fs.readFileSync(docFullPath, "utf8")
  let content = contentOriginal + "" // Copy

  let match
  while (match = pattern.exec(contentOriginal)) { // eslint-disable-line no-cond-assign
    // /Users/strajk/Dropbox/brain/__global-assets/1635879231.png
    // ... TODO ...
    let assetPath = match[1].replace(/%20/g, " ") // Replace %20 with space

    if (assetPath.startsWith("/")) {
      console.log(chalk.gray("» Local absolute"), chalk.blue(assetPath))

      const assetName = path.basename(assetPath) // `1635879231.png`
      const newAbsPath = path.resolve(outputAssetsDir, assetName)
      const newRelPath = `./assets/${assetName}`
      fs.copyFileSync(assetPath, newAbsPath)

      // #REPLACE
      content = content.replace(new RegExp(assetPath, "g"), newRelPath)
    } else if (assetPath.includes("//")) { // TODO: Better detection of absolute path
      // Download
      const res = await axios.get(assetPath, { responseType: "arraybuffer" })

      // Detect type
      // ---
      // res.headers["content-type"] => `image/jpeg`
      // Read first 12 bytes - enough to detect type
      const ext = path.extname(assetPath) || ("." + imageType(res.data).ext)

      // Save
      // ---
      const assetName = path.basename(assetPath, ext)
      const newName = `${assetName}${ext}`
      const newAbsPath = path.resolve(assetsDir, newName)
      const newRelPath = `./${docBasename}.assets/${newName}`
      fs.writeFileSync(newAbsPath, res.data)

      // #REPLACE
      content = content.replace(new RegExp(assetPath, "g"), newRelPath)

      // TODO
      debugger
    }
  }

  fs.writeFileSync(`${outputDir}/index.md`, content)

  console.log("That's all folks, all done, wasn't that hard, right?")
})()
