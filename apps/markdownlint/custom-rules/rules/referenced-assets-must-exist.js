const fs = require("fs")
const { flat } = require("../lib")

module.exports = {
  names: ["referenced-assets-must-exist"],
  description: "Referenced assets must exist",
  tags: ["test"],
  function: function rule (params, onError) {
    const images = flat(params.tokens).filter((token) => token.type === "image")

    // TODO: Support other local assets

    for (const image of images) {
      for (const [attrKey, attrVal] of image.attrs) {
        if (attrKey === "src") {
          let assetSrc = attrVal

          // Ignore external images
          if (assetSrc.startsWith("http")) break

          // Trim possible query string
          if (assetSrc.includes("?")) assetSrc = assetSrc.slice(0, assetSrc.indexOf("?"))

          // Construct path
          const dir = params.name.split("/").slice(0, -1).join("/")

          const path = `${dir}/${assetSrc}`
          const pathDecoded = decodeURIComponent(path) // to support "Screenshot 2022-11-19 at 10.38.49.png" being encoded into "Screenshot%202022-11-19%20at%2010.38.49.png"

          if (
            !fs.existsSync(path) &&
            !fs.existsSync(pathDecoded)
          ) {
            onError({
              lineNumber: image.lineNumber,
              detail: `Asset '${assetSrc}' does not link to a valid file.`,
              context: image.line,
            })
          }
        }
      }
    }
  },
}
