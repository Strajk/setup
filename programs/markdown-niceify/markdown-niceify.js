/*BEWARE: Quick'n'dirty script*/

/* NOTES
   =====

Inspiration <https://github.com/vweevers/hallmark>

*/

import fs from "fs"
import remark from "remark"
import { visit } from "unist-util-visit"
import { toString } from "mdast-util-to-string"
import minimist from "minimist"
import Diff from "diff"

import remarkLintEmphasisMarker from "remark-lint-emphasis-marker"
import remarkLintListItemIndent from "remark-lint-list-item-indent"
import remarkLintListItemBulletIndent from "remark-lint-list-item-bullet-indent"

const argv = minimist(process.argv.slice(2))

function linksPure(input) {
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

export function main (input) {
  let modified = remark()
    .use(remarkLintEmphasisMarker, "*")
    .use(remarkLintListItemIndent, "space")
    .use(remarkLintListItemBulletIndent, "space")
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

if (!import.meta.url) {
  const file = argv.file
  // TODO: Allow globs <https://www.npmjs.com/package/is-glob>
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
}
