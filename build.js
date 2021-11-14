/* eslint-disable no-unused-vars */
const fs = require("fs")
const path = require("path")

const globby = require("globby")
const marked = require("marked")
const _ = require("lodash")
const replace = require("replace-in-file")
const cpFile = require("cp-file")
const plist = require("plist")
const YAML = require("yaml")
const uuidv5 = require("uuid/v5")
const toc = require("markdown-toc")

// <SHAME-ON-YOU>

// SNIPPETS
// ===

const INFO_PLIST_TEMPLATE = _.template(`
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>snippetkeywordprefix</key>
  <string><%= prefix %></string>
  <key>snippetkeywordsuffix</key>
  <string><%= suffix %></string>
</dict>
</plist>
`.trim())

// SNIPPETS: From YML
// ---
// TODO: Escape `/` with `\/`
const alfredSnippets = YAML.parse(fs.readFileSync("./snippets/global.yml", "utf8"))
for (const key in alfredSnippets) {
  const obj = alfredSnippets[key]

  const [_, collection, prefix, suffix] = key.match(/(.+){(.*)}{(.*)}/)
  const path = `./apps/Alfred/snippets/${collection}`
  try {
    fs.rmdirSync(path, { recursive: true })
    fs.mkdirSync(path)
  } catch (e) {
    // already exists
  }

  fs.writeFileSync(path + "/info.plist", INFO_PLIST_TEMPLATE({ prefix, suffix }))

  const keywords = []
  for (const subKey in obj) {
    const subObj = obj[subKey]
    const [_, name, keyword] = subKey.match(/(.+){(.*)}/)
    keywords.push(keyword)
    const uuid = uuidv5(subKey, "00000000-0000-0000-0000-000000000000")
    fs.writeFileSync(`${path}/${uuid}.json`, JSON.stringify({
      alfredsnippet: {
        uid: uuid,
        name,
        keyword,
        snippet: subObj,
      },
    }, null, "\t"))
  }

  keywords
    .sort((a, b) => a.length - b.length) // Sort by length
    .reduce((acc, keyword, currI, all) => {
      if (acc.has(keyword)) {
        console.error(`🚫 Snippets check: ${keyword} duplicate`)
      } else {
        for (let i = keyword.length - 1; i > 0; i--) {
          const part = keyword.substr(0, i)
          if (acc.has(part)) console.error(`🚫 Snippets check: "${keyword}" conflict with "${part}"`)
        }
      }
      return acc.add(keyword)
    }, new Set())
}

// SNIPPETS: From raw files
// ---
const files = globby.sync(["./snippets/raw/**/*"])
files.forEach(file => {
  const name = path.basename(file, path.extname(file))
  const uuid = uuidv5(name, "00000000-0000-0000-0000-000000000000")
  fs.writeFileSync(`./apps/Alfred/snippets/raw/${uuid}.json`, JSON.stringify({
    alfredsnippet: {
      uid: uuid,
      name,
      snippet: fs.readFileSync(file, "utf8"),
    },
  }, null, "\t"))
})

// Dash
// ===
const dashPlist = plist.parse(fs.readFileSync("/Users/strajk/Dropbox/Sync/Dash.dashsync/Preferences.plist", "utf8"))
const dashOutput = []
for (const key in dashPlist) {
  const obj = dashPlist[key]
  if (key.endsWith("Repo")) {
    for (const subKey in obj.installed) {
      const subObj = obj.installed[subKey]
      dashOutput.push(`${key.replace(/DH(.+)Repo/, "$1")}: ${subObj.entry.name.replace(" (Offline)", "")}`)
    }
  }

  if (key === "feeds") {
    for (const subKey in obj.installed) {
      dashOutput.push(`Docset: ${subKey.replace(/https?:\/\/kapeli.com\/feeds\/(.+)\.xml/, "$1").replace("_", " ")}`)
    }
  }
}
cpFile.sync("README.src.md", "README.md")
replace.sync({
  files: "README.md",
  from: "{{{ dash-prefs }}}",
  to: dashOutput.join("\n"),
})

// </SHAME-ON-YOU>

const readme = fs.readFileSync("./README.md", "utf-8")

fs.writeFileSync(
  "./README.md",
  toc.insert(readme, {
    maxdepth: 2,
    filter (content, element) {
      // BEWARE: lvl is different from level (aka depth)
      // lvl is absolute (h1-h6), level/depth is relative
      if (element.lvl <= 2) return true
      return false
    },
    bullets: "-",
    slugify: (text) => text.toLowerCase().replace(/\s+/g, "-"),
  }),
)

const tokens = marked.lexer(readme)
const codeblocks = tokens.filter(x => x.type === "code" && x.lang.includes("<!-- >"))

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
  cpFile.sync(`${file}.src`, file) // TODO: Handle ext name, eg: `file.src.js`
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
