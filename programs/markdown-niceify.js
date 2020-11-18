/* BEWARE: Quick'n'dirty script */
const fs = require("fs")
const remark = require("remark")
const visit = require("unist-util-visit")
const toString = require("mdast-util-to-string")

const argv = require("minimist")(process.argv.slice(2))
const Diff = require("diff")
require("colors")

function linksPure (input) {
  let match

  match = input.match(/reddit\.com(.+?)\/?$/)
  if (match) {
    return match[1]
      .replace(/^\/user\//, "/u/")
  }

  return input
    // Trim protocol and www subdomain
    .replace(/^https?:\/\/(www\.)?/, "")
    // Trim general file type
    .replace(/\.html$/, "")
}

function main (input) {
  let modified = remark()
    .use(options => {
      return ast => {
        visit(ast, "link", node => {
          const value = toString(node)
          if (value === node.url) {
            node.children = [
              {
                type: "text",
                value: linksPure(value),
              },
            ]
          }
        })
      }
    })
    .use({
      settings: {
        emphasis: "*", // default: ~
        listItemIndent: "1", // default: `tab`
        fences: true, // default: `false` - Create code blocks with a fence instead of indentation if they have no info string
      },
    }).processSync(input).contents

  return modified
}

if (!module.parent) {
  const file = argv.file
  // TODO: Allow globs https://www.npmjs.com/package/is-glob
  if (!file) {
    console.error("No file specified")
    process.exit()
  }

  const original = fs.readFileSync(file, "utf-8")
  const modified = main(original)

  var diff = Diff.diffChars(original, modified)
  diff.forEach(part => {
    var color = part.added ? "green" : part.removed ? "red" : "grey"
    process.stdout.write(part.value[color])
  })

  fs.writeFileSync(file, modified)
} else {
  // required by another module
  module.exports = main
}
