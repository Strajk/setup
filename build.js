const fs = require("fs")
const marked = require("marked")
const _ = require("lodash")
const replace = require("replace-in-file")
const cpFile = require("cp-file")

const readme = fs.readFileSync("./README.md", "utf-8")
const tokens = marked.lexer(readme)
const codeblocks = tokens.filter(x =>
  x.type === "code" &&
    x.lang.includes("<!-- >"),
)

const COLLECTION = {}

codeblocks.forEach(codeblock => {
  const [file, section] = codeblock
    .lang // bash <!-- >home/Brewfile#fonts -->
    .match(/<!-- >(.+) -->/)[1] // home/Brewfile#fonts
    .split("#") // ["home/Brewfile", "fonts"]

  _.update(
    COLLECTION,
    [file, section],
    val => (val || "") + codeblock.text + "\n",
  )
})

_.forEach(COLLECTION, (sections, file) => {
  // TODO: Check if source file exists
  cpFile.sync(`_src/${file}`, file)
  _.forEach(sections, (content, section) => {
    try {
      const results = replace.sync({
        files: file,
        from: new RegExp(`{{{ ${section} }}}`),
        to: content.trim(),
      })
      console.log("Replacement results:", results)
    } catch (err) {
      console.error("Error occurred:", err)
    }
  })
})
