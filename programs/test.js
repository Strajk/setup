const fs = require("fs")
const Slack = require("slack")
const lodash = require("lodash")
const { Parser } = require("json2csv")

const parser = new Parser({ delimiter: "" })

const res = [
  { $name: "foo", "a": "Y", "b": "Y" },
  { $name: "bar", "c": "Y", "d": "Y" },
  { $name: "gar", "a": "Y" },
]

const tsv = parser.parse(res)
console.log(tsv) // ?
