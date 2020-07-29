const fs = require("fs")
const path = require("path")
const glob = require("glob")
const chalk = require("chalk")
const mkdirp = require("mkdirp")
const imageType = require("image-type")
const axios = require("axios")

// TODO: Just for testing right now
const PATH = "/Users/strajk/Code/setup/programs/markdown-download-remote-assets/test"

const filepaths = glob.sync(PATH + "/**/*.md")

const pattern = /!\[.*\]\((.+)\)/g;

(async () => {
  for (const filepath of filepaths) {
    console.log(chalk.gray("Processing: ") + chalk.blue(filepath))
    const contentOriginal = fs.readFileSync(filepath, "utf8")
    let content = contentOriginal + "" // Copy

    let match
    while (match = pattern.exec(contentOriginal)) {
      const assetPath = match[1] // resources/ABF8EA7D-C95B-4278-903A-19E5C9A1991C
      if (assetPath.includes("//")) { // TODO: Better detection of absolute path
        const dirname = path.dirname(filepath)
        const docName = path.basename(filepath, ".md")

        const assetsDir = path.resolve(dirname, `${docName}.assets`)
        mkdirp.sync(assetsDir) // TODO: Only once?

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
        const newRelPath = `./${docName}.assets/${newName}`
        fs.writeFileSync(newAbsPath, res.data)

        // Replace occurrence
        // ---
        content = content.replace(new RegExp(assetPath, "g"), newRelPath)

        // TODO
        debugger
      }
    }

    fs.writeFileSync(`${filepath}.md`, content)
  }

  console.log("That's all folks, all done, wasn't that hard, right?")
})()
