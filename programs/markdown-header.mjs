#!/usr/bin/env /usr/local/opt/node@12/bin/node

// TODO: Make it work general node

import getStdin from "get-stdin"
import _ from "lodash"

;(async () => {
  const input = await getStdin()
  const [text, level] = input.split("|||").map(x => x.trim())
  const stripped = _.trimStart(text, "#").trim()
  const outout = `${"#".repeat(level)} ${stripped}`
  console.log(outout)
})()
