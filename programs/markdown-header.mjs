#!/usr/bin/env node

import getStdin from "get-stdin"
import _ from "lodash"

;(async () => {
  const input = await getStdin()
  const [text, level] = input.split("|||").map(x => x.trim())
  const stripped = _.trimStart(text, "#").trim()
  const outout = `${"#".repeat(level)} ${stripped}`
  console.log(outout)
})()
