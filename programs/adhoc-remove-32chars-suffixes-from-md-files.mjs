#!/usr/bin/env node
import { chalk, fs, globby, argv, $ } from "zx"
$.verbose = false // disable zx's printing to console

const searchValue = / [a-z0-9]{32}\.md$/;
const files = globby.globbySync("**/*.md")
let counter = 0
for (const filepath of files) {
  if (filepath.match(searchValue)) {
    const newFilepath = filepath.replace(searchValue, ".md")
    console.log(chalk.red(`${filepath}`) + " -> " + chalk.green(newFilepath))
    try {
      await $`git mv ${filepath} ${newFilepath}` // git aware rename
    } catch (err) {
      if (err.message.includes('destination exists')) {
        console.log(chalk.yellow(`Destination exists, cancelling, deal with it manually!`))
        break
      }
    }
    counter++
    if (counter > 10) break // let's do it step by step
  }
}
