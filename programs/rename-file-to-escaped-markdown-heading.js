/* eslint-env node */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process") // TODO: Remove after solving the issue with execa

const argv = require("minimist")(process.argv.slice(2))
const getSlug = require("speakingurl")
const execa = require("execa")

const file = argv.file

if (!file) return console.error("No file specified")

const fileContent = fs.readFileSync(file, "utf8")
const titleRegex = /^# (.+)\n/

const match = titleRegex.exec(fileContent)

if (Array.isArray(match) && match.length === 2) {
  const title = match[1]
  const slug = getSlug(title)
  const newPath = path.dirname(file) + "/" + slug + ".md"
  console.log("FROM:")
  console.log(file)
  console.log("TO:")
  console.log(newPath)

  const dirname = path.dirname(file)

  let repo
  try {
    repo = execa.commandSync("git rev-parse --show-toplevel", { cwd: dirname }).stdout
  } catch (err) {
    if (!err.stderr.includes("not a git repository")) throw err
  }

  if (repo) {
    console.log("Renaming using git")
    const relativeOrig = path.relative(dirname, file)
    const relativeNew = path.relative(dirname, newPath)

    // TODO: Debug why execa is not working
    // Throwing: destination 'relativeNew' is not a directory
    // const res = execa.commandSync(`git mv "${relativeOrig}" "${relativeNew}"`, { cwd: repo })

    const res = execSync(`git mv "${relativeOrig}" "${relativeNew}"`, { cwd: repo })
    console.log(res.toString()) // TODO: Handle errors
  } else {
    console.log("Renaming using fs.rename")
    fs.renameSync(file, newPath)
  }
} else {
  console.log("Bad match", match)
}
