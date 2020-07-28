#!/usr/bin/env node

import getStdin from "get-stdin"
import slugify from "slugify"

(async () => {
  const input = await getStdin()
  const slugifiedInput = slugify(input)
  console.log(slugifiedInput)
})()
