## About --harmony-top-level-await

Node supports using `await` on top-level with `--harmony-top-level-await` flag, but
- it doesn't work well with ESLint `Parsing error: Cannot use keyword 'await' outside an async function`,
- `--no-warnings` flag is also required, which could hide other problems

```
#!/usr/bin/env node --harmony-top-level-await --no-warnings
import getStdin from "get-stdin"
const input = await getStdin()
// ... process
console.log(output)
```
