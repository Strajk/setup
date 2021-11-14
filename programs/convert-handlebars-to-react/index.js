#!/usr/bin/env node
const getStdin = require("get-stdin")

function main (input) {
  let output = input
  output = output.replace("{{>", "<")
  output = output.replace(/=(.+)/g, "={$1}")
  output = output.replace("}}", "/>")
  output = output.replace("", "")
  output = output.replace("", "")

  output = output.replace(/.+captionCells.+/i, "")
  output = output.replace(/.+gridCells.+/i, "")
  output = output.split("\n").filter(x => !!x).join("\n")

  return output
}

if (!module.parent) {
  (async () => {
    const input = await getStdin()
    console.log(main(input))
  })()
} else {
  // required by another module
  module.exports = main
}
