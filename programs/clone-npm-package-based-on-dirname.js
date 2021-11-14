/* BEWARE: Quick'n'dirty script */
const path = require("path")
const { execSync } = require("child_process")
const repoUrl = require("get-repository-url")

const argv = require("minimist")(process.argv.slice(2))

;(async () => {
  const file = argv.file // || "/Users/strajk/Projects/DefinitelyTyped/types/abs"
  if (!file) {
    console.error("No file specified")
    process.exit()
  }

  const name = path.basename(file)
  const repo = await repoUrl(name)
  execSync(`git clone ${repo} ${name} --depth 50`, { cwd: file, stdio: "inherit" })
})()
