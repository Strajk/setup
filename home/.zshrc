# TODO: This got messy fast, need to clean it up

# Profiling (Part 1/2) - uncomment to profile startup time
# zmodload zsh/zprof

# Secrets
# ---
source $HOME/.secrets # Load secrets
source "/opt/homebrew/opt/spaceship/spaceship.zsh" # Init Spaceship ZSH

export ZSH=$HOME/.oh-my-zsh

# hstr
# https://github.com/dvorka/hstr
# ---
export HISTFILE=$HOME/.zsh_history
export HH_CONFIG=hicolor

# export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
export HOMEBREW_NO_AUTO_UPDATE=1

# Plugins
# ---
#plugins=(git github brew macos git-extras zsh-autosuggestions zsh-syntax-highlighting)
#plugins=(brew macos git-extras zsh-autosuggestions zsh-syntax-highlighting)
# plugins=(nvm git)
# https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/nvm
# https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/git


# Action!
# ---
source $ZSH/oh-my-zsh.sh

### TODO: Inspect effect on shell startup time

# Aliases
# ---
# Monkeypatch symlink with logging
alias ln='function _ln() {
  command ln "$@"
  if [ $? -eq 0 ] && [ "$1" = "-s" ]; then
    echo "$(date +"%Y-%m-%d %H:%M:%S") | $2 -> $3" >> ~/symlinks.txt
    echo "✓ Symlink created and logged to ~/symlinks.txt"
  fi
}; _ln'


alias gcl="git clone"


alias rap='function _rap(){ say -o /tmp/temp.aiff "$1"; lame -m m /tmp/temp.aiff ~/Downloads/yo-listen.mp3; rm /tmp/temp.aiff; }; _rap'

alias ~="cd ~"
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias .....="cd ../../../.."
alias mkcd='function _mkcd() { mkdir -p "$1" && cd "$1"; }; _mkcd'


alias brewup="brew update; brew upgrade; brew cleanup; brew doctor"

alias p="pnpm"
alias c="cursor"
alias cl="clear"
alias rmnm="find . -name 'node_modules' -type d -prune -print -exec rm -rf '{}' \;"

alias g-unpushed="git --no-pager log --branches --not --remotes=origin --no-walk --decorate --oneline"

alias notan="open -n /Applications/Nota.app"

alias chrs="\"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome\" --remote-debugging-port=9222"
alias chrd="\"/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev\" --remote-debugging-port=9222 --user-data-dir=\"$HOME/.chrome-dev-debug\" --profile-directory=\"Profile 12\""
alias chrc="\"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary\" --remote-debugging-port=9222"
alias chr-kiwiai="\"/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev\" --remote-debugging-port=9222 --profile-directory=\"Profile 14\""
alias chr-pavel="\"/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev\" --remote-debugging-port=9222 --profile-directory=\"Profile 13\""

alias uvr="uv venv --python 3.12 && uv pip install -r requirements.txt && source .venv/bin/activate"

function runInSubs() {
  for d in ./*/ ; do /bin/zsh -c "(cd "$d" && echo "$d" && echo '===' && "$@")"; done
}

function vscli() {
    local command_id="$1"
    local tmp_dir="$HOME/clai/vscode-ext"
    local request_file="$tmp_dir/req.json"
    
    # Create JSON payload
    local json="{\"commandId\": \"$command_id\"}"
    
    # Ensure directory exists
    mkdir -p "$tmp_dir"
    
    # Write JSON to file
    echo "$json" > "$request_file"
}


# Commands
# ---
function md() {
    mkdir $1 && cd $1;
}

cdf() {
    target=`osascript -e 'tell application "Finder" to if (count of Finder windows) > 0 then get POSIX path of (target of front Finder window as text)'`
    if [ "$target" != "" ]; then
        cd "$target"; pwd
    else
        echo 'No Finder window found' >&2
    fi
}


# Adjust PATH
# ---
#export GOPATH="/Users/strajk/go/go1.21.1"
export PATH="/Users/strajk/bin:/usr/local/sbin:$PATH"
export PATH="/Users/strajk/Projects/setup/programs/bin:$PATH"
export PATH="/usr/local/opt/openjdk/bin:$PATH"
export PATH="/Users/strajk/go/go1.21.1/bin:$PATH"
export PATH="/Users/strajk/google-cloud-sdk/bin:$PATH"
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
export PATH="/opt/homebrew/lib/ruby/gems/3.3.0/bin:$PATH"
export PATH="/Users/strajk/.codeium/windsurf/bin:$PATH"
export PATH="$PATH:/Users/strajk/.local/bin" # by pipx
export PATH="$BUN_INSTALL/bin:$PATH"
export PATH="/Users/strajk/Applications/WebStorm.app/Contents/MacOS:$PATH"
export PATH="/opt/homebrew/opt/binutils/bin:$PATH"
export PATH="$DENO_INSTALL/bin:$PATH"
export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
export PATH="/Users/strajk/Library/Application Support/JetBrains/Toolbox/scripts:$PATH"
export PATH="/Users/strajk/.deno/bin:$PATH"
export PATH="$PATH:/Users/strajk/.cache/lm-studio/bin"


eval "$(direnv hook zsh)"

# Profiling (Part 2/2) - uncomment to profile startup time
# zprof


fpath=($fpath "/Users/strajk/.zfunctions")

# Set Spaceship ZSH as a prompt

SPACESHIP_AWS_SHOW=false
SPACESHIP_GCLOUD_SHOW=false

autoload -U promptinit; promptinit
# prompt spaceship

# Generated for envman. Do not edit.
[ -s "$HOME/.config/envman/load.sh" ] && source "$HOME/.config/envman/load.sh"


# VARIOUS CONFIGS
# ================
export REACT_EDITOR=cursor

## Specific
## ========

# Deno
export DENO_INSTALL="/Users/strajk/.deno"

# bun
[ -s "/Users/strajk/.bun/_bun" ] && source "/Users/strajk/.bun/_bun"
export BUN_INSTALL="$HOME/.bun"

# Rust
. "$HOME/.cargo/env"


export UV_PYTHON="3.12"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
# pnpm
export PNPM_HOME="/Users/strajk/Library/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end

# Added by Windsurf
export PATH="/Users/strajk/.codeium/windsurf/bin:$PATH"
. "/Users/strajk/.deno/env"
# Initialize zsh completions (added by deno install script)
autoload -Uz compinit
compinit


# Custom commands
# ================

# venv:
# -----
# - if .venv exists, activate it
# - if not, and requirements.txt exists, run uv venv & pip install -r requirements.txt & source .venv/bin/activate
# - if not, and pyproject.toml exists, run uv sync & source .venv/bin/activate
# - if not, run uv init
alias venv='function _venv() {
  if [ -d ".venv" ]; then
    source .venv/bin/activate
  elif [ -f "requirements.txt" ]; then
    uv venv && uv pip install --only-binary=:all: -r requirements.txt && source .venv/bin/activate
  elif [ -f "pyproject.toml" ]; then
    uv venv && uv sync && source .venv/bin/activate
  else
    uv init
  fi
}; _venv'



# Git worktree
# ------------
# Credits https://x.com/johnlindquist
# 1. Gets current branch name and appends provided suffix
# 2. Creates directory name from current repo name and suffix in parent directory
# 3. Creates new worktree with the new branch in the new directory
# 4. Opens the new directory in specified editor (Cursor or VS Code)
# 5. Copies absolute path to clipboard
#
# Usage: wetree <suffix> <editor>
# Example: wetree fix-foo code
# Example: wetree test cursor
alias wetree='function _wetree() { \
    branch="$(git rev-parse --abbrev-ref HEAD)-$1"; \
    dir="../$(basename $(git rev-parse --show-toplevel))-$1"; \
    git worktree add -b "$branch" "$dir"; \
    absolute_dir="$(cd "$dir" && pwd)"; \
    echo "$absolute_dir" | pbcopy; \
    $2 -n "$absolute_dir"; \
    open "$parent_dir"; \
}; _wetree'

# Git worktree cleanup alias that:
# 1. Merges current branch to parent branch
# 2. Removes worktree and deletes branch
# 3. Goes back to parent directory
alias wetree-done='function _wetree_done() {
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    parent_branch=${current_branch%-*}
    current_dir=$(pwd)
    parent_dir=$(dirname "$current_dir")

    git checkout "$parent_branch" && \
    git merge "$current_branch" && \
    cd "$parent_dir" && \
    git worktree remove "$current_dir" && \
    git branch -D "$current_branch"
}; _wetree_done'

