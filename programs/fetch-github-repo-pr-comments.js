/**
 * Given a GitHub repository name, fetches the pull request comments and stores them in json & csv format
 */

const ARG_REPO = "apify/apify-core"
const ARG_MAX = 1000

const fs = require("fs")
const path = require("path")
const { Octokit } = require("@octokit/rest")
const { parse } = require("json2csv")

const token = process.env.GITHUB_TOKEN
if (!token) {
  console.log("Please set GITHUB_TOKEN environment variable.")
  process.exit(1)
}
const octokit = new Octokit({ auth: token })

const results = [];
(async () => {
  await octokit.paginate(
    `GET /repos/${ARG_REPO}/pulls/comments`,
    { per_page: 100 },
    (response, done) => {
      results.push(...response.data.map(pick))
      // eslint-disable-next-line max-len
      console.log(`Scraped: ${results.length} | Rate limit: ${response.headers["x-ratelimit-used"]}/${response.headers["x-ratelimit-limit"]} (refreshes ${new Date(response.headers["x-ratelimit-reset"] * 1000).toISOString()})`)
      if (results.length >= ARG_MAX) done()
    },
  )

  const scriptName = path.parse(__filename).name

  fs.writeFileSync(`./${scriptName}.json`, JSON.stringify(results, null, 2))
  fs.writeFileSync(`./${scriptName}.csv`, parse(results))
})()

function pick (x) {
  return {
    url: x.html_url,
    created_at: x.created_at,
    path: x.path,
    user: x.user.login,
    diff_hunk: x.diff_hunk,
    body: x.body,
    id: x.id,
    in_reply_to_id: x.in_reply_to_id,
  }
}
