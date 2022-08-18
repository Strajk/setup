#!/usr/bin/env /Users/strajk/.nvm/versions/node/v18.4.0/bin/node
// TODO: Improve shebang

// https://regexr.com/51ael
// https://regexr.com/51af7 new

import getStdin from "get-stdin"

const slyfy = input => {
  return input
    .replace(/https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
}

(async () => {
  const input = await getStdin()
  console.log(slyfy(input))
})()
