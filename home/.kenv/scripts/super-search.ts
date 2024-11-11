// Menu: Super Search across multiple websites
// Description: Search multiple websites, in bulk, in your browser
// Author: Pavel 'Strajk' Dolecek <www.strajk.me>
// Twitter: @straaajk
//// Shortcut: command option ;
// me.strajk:status WIP

// BEWARE: Discord search requires my userscript:
// https://github.com/Strajk/setup/blob/master/user-scripts/discord-search-from-q-url-param.user.js

let templates = {
  discord: `https://discord.com/channels/{slug}/?q={query}`,
  githubRepo: `https://github.com/{slug}/issues?q={query}`,
  githubDiscussion: `https://github.com/{slug}/discussions?discussions_q={query}`,
  twitter: `https://x.com/search?q=from%3A{slug}+{query}`,
  reddit: `https://www.reddit.com/r/{slug}/search?q={query}`,
  // TODO:
  // Slack: But even harder than Discord https://stackoverflow.com/questions/51541986/a-way-to-open-up-slack-search-ui-in-a-browser-from-a-url
}

// Each topic can only use search templates defined above (discord, githubRepo, githubDiscussion)
// but doesn't need to include all of them - just some are enough
// ⬇⬇⬇ EDIT TO YOUR LIKING ⬇⬇⬇
let topics: Record<string, Partial<{[K in keyof typeof templates]: string[]}>> = {
  kit: {
    discord: [`804053880266686464`],
    githubRepo: [`johnlindquist/kit`],
    githubDiscussion: [`johnlindquist/kit`],
    twitter: [`scriptkitapp`],
  },
  litellm: {
    discord: [`1123360753068540065`],
    githubRepo: [`BerriAI/litellm`],
    githubDiscussion: [`BerriAI/litellm`],
    twitter: [`LiteLLM`],
  },
  wxt: {
    discord: [`1212416027611365476`],
    githubRepo: [`wxt-dev/wxt`],
    githubDiscussion: [`wxt-dev/wxt`]
  },
  coolify: {
    discord: [`459365938081431553`],
    githubRepo: [`coollabsio/coolify`],
    githubDiscussion: [`coollabsio/coolify`],
    twitter: [`coolify`],
  },
  crawlee: {
    discord: [`801163717915574323`],
    githubRepo: [`apify/crawlee`],
    githubDiscussion: [`apify/crawlee`]
  },
  mantine: {
    discord: [`854810300876062770`],
    githubRepo: [`mantinedev/mantine`],
    githubDiscussion: [`orgs/mantinedev`], // note it's different from repo above
    twitter: [`mantinedev`],
  },
  supabase: {
    discord: [`839993398554656828`],
    githubDiscussion: [`orgs/supabase`],
    reddit: [`Supabase`],
    githubRepo: [
      `supabase/supabase`,
      `supabase/supabase-js`,
      `supabase/cli`,
      `supabase/postgrest-js`,
      `supabase/supabase-py`,
    ],
  },
  pnpm: {
    discord: [`731599538665553971`],
    githubRepo: [`pnpm/pnpm`],
    githubDiscussion: [`pnpm/pnpm`],
  },
  ai: {
    discord: [
      `1110910277110743103`, // superagent
      `1153072414184452236`, // autogen
      `822583790773862470`, // latentspace
      `1122748573000409160`, // ai stack devs
      `877056448956346408`, // lablablab
    ],
  },
  nextjs: {
    discord: [
      `752553802359505017`, // nextjs
      `966627436387266600`, // theo typesafe cult
    ],
  },
  plasmo: {
    githubDiscussion: [`PlasmoHQ/plasmo`],
    githubRepo: [`PlasmoHQ/plasmo`],
    discord: [`946290204443025438`],
  },
  scraping: {
    discord: [
      `646150246094602263`, // scraping in prod
      `851364676688543744`, // scrapy
      `737009125862408274`, // scraping enthusiasts
    ],
  }
}

let hint = `${isMac ? `⌘` : `Control`}+o to edit`
let type = await arg({
  placeholder: `What topic? ${hint}`,
  choices: Object.keys(topics),
})
let query = await arg('Query?')


let topicObj = topics[type] // e.g. { discord: ['123', '345'], github: ['foo'] }
for (const [key, slugs] of Object.entries(topicObj)) {
  // key is e.g. discord, githubIssues, githubDiscussions, ...
  // slugs are e.g. ['12356', 'facebook/react']
  for (const slug of slugs) {
    // slug e.g. '12356', 'facebook/react'
    let urlTemplate = templates[key] // e.g. 'github.com/{id}/issues?q={query}'
    let url = urlTemplate
      .replace('{slug}', slug) // e.g. 'facebook/react'
      .replace('{query}', encodeURI(query)) // e.g. 'foo'
    exec(`open ${url}`)
  }
}

