# Profiling (Part 1/2) - uncomment to profile startup time
# zmodload zsh/zprof

export ZSH_THEME="spaceship"

# Secrets
# ---
source $HOME/.secrets

export ZSH=$HOME/.oh-my-zsh

### TODO: Inspect effect on shell startup time
export NVM_DIR=$HOME/.nvm

# hstr
# https://github.com/dvorka/hstr
# ---
export HISTFILE=$HOME/.zsh_history
export HH_CONFIG=hicolor

export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

# Plugins
# ---
plugins=(git github brew osx git-extras zsh-autosuggestions zsh-syntax-highlighting)


# Action!
# ---
source $ZSH/oh-my-zsh.sh

### TODO: Inspect effect on shell startup time

# Create default symlink by default github.com/nvm-sh/nvm
export NVM_SYMLINK_CURRENT=true
source $(brew --prefix nvm)/nvm.sh


# Aliases
# ---
alias ~="cd ~"
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias .....="cd ../../../.."

alias venv="source venv/bin/activate"
alias brewup="brew update; brew upgrade; brew prune; brew cleanup; brew doctor"

alias ws="webstorm ."

alias g-unpushed="git --no-pager log --branches --not --remotes=origin --no-walk --decorate --oneline"

alias mm=~/Projects/meteor/meteor

function runInSubs() {
  for d in ./*/ ; do /bin/zsh -c "(cd "$d" && echo "$d" && echo '===' && "$@")"; done
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


source '/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/path.zsh.inc'
source '/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/completion.zsh.inc'


# Adjust PATH
# ---
export PATH="/Users/strajk/bin:/usr/local/sbin:$PATH"
export PATH="/usr/local/opt/openjdk/bin:$PATH"

eval "$(direnv hook zsh)"

# Profiling (Part 2/2) - uncomment to profile startup time
# zprof


# https://github.com/VSCodium/vscodium/blob/master/DOCS.md#how-to-use-the-vs-code-marketplace
# TODO: Validate that this really works
export VSCODE_GALLERY_SERVICE_URL='https://marketplace.visualstudio.com/_apis/public/gallery'
export VSCODE_GALLERY_CACHE_URL='https://vscode.blob.core.windows.net/gallery/index'
export VSCODE_GALLERY_ITEM_URL='https://marketplace.visualstudio.com/items'
export VSCODE_GALLERY_CONTROL_URL=''
export VSCODE_GALLERY_RECOMMENDATIONS_URL=''