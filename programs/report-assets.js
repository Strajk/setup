/* BEWARE: Quick'n'dirty script */
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")
const glob = require("glob")
const chalk = require("chalk")
const filesize = require("filesize")

// const imageType = require("image-type")

// TODO: Just for testing right now
const PATH = "/Users/strajk/Code/strajk.me-next/pages/notes/2020/meteor-impact/assets"

const filepaths = glob.sync(PATH + "/**/*.{png,jpg}")

;(async () => {
  for (const filepath of filepaths) {
    const relative = filepath.replace(PATH, "")
    const res = execSync(`identify -quiet -format %Q ${filepath}`) // -quiet to ignore "iCCP: extra compressed data" warnings https://stackoverflow.com/a/31295891/1732483
    const stats = fs.statSync(filepath)
    const size = filesize(stats.size)
    console.log(`${chalk.gray(relative)}: ${res}% ${size}`)
  }
  console.log("That's all folks, all done, wasn't that hard, right?")
})()
