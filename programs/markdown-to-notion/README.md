## Goal

Upload markdown files to Notion.

## Solution

Use https://github.com/Cobertos/md2notion

BUT! It's dependency, [notion-py](https://github.com/jamalex/notion-py),
is [broken](https://github.com/jamalex/notion-py/issues/305),
so it's needed to replace it by [fixed version](https://github.com/jamalex/notion-py.git@refs/pull/294/merge)

#### Solution in PyCharm (horrible, but works)

* Open "Python Packages" tool window
* Remove "notion" package
* Click on "Add Package"
* Add `https://github.com/jamalex/notion-py.git@refs/pull/294/merge` 

#### Idiomatic Python solution

Probably something similar to yarn's [resolutions](https://classic.yarnpkg.com/lang/en/docs/selective-version-resolutions/)

@lbenka was nice enough to share his solution:
https://github.com/lbenka/md2notion-req


