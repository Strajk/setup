const token = process.env.SLACK_BOT_TOKEN
const fs = require("fs")
const Slack = require("slack")
const lodash = require("lodash")
const { Parser } = require("json2csv")

const slack = new Slack({ token })
const parser = new Parser({ delimiter: "\t" })

const res = []

;(async function main () {
  const usersRes = await slack.users.list({ limit: 500 })
  const users = lodash.keyBy(usersRes.members, "id") // Note: .members is correct
  console.log("Users fetched", usersRes.members.length)
  const channelsRes = await slack.conversations.list({ limit: 500 })
  const channels = channelsRes.channels.filter(x =>
    x.is_channel === true &&
    x.is_archived === false &&
    !x.name.startsWith("3rd") && // Beware: My use-case specific
    !x.name.startsWith("x_"), // Beware: My use-case specific
  )
  console.log("Channels fetched", channels.length)
  for (const channel of channels) {
    console.log("Channel processing", channel.id, channel.name)
    try {
      const membersRes = await slack.conversations.members({ channel: channel.id })
      const members = membersRes.members
      const row = { $name: channel.name }
      members.forEach(member => {
        const user = users[member]
        if (!user) return
        const name = user.name
        row[name] = "•"
      })
      res.push(row)
    } catch (err) {
      console.error(err)
    }
  }
  fs.writeFileSync("./report.tsv", parser.parse(res))
})()
