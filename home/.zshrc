# Secrets
# ---
source $HOME/.secrets

export ZSH=$HOME/.oh-my-zsh

export NVM_DIR=$HOME/.nvm

# hstr
# https://github.com/dvorka/hstr
# ---
export HISTFILE=$HOME/.zsh_history
export HH_CONFIG=hicolor


# Plugins
# ---
plugins=(git git-flow github brew osx work ruby rbenv git-extras git-extra-commands dotenv)


# Action!
# ---
source $ZSH/oh-my-zsh.sh
source $(brew --prefix nvm)/nvm.sh


# Aliases
# ---
alias venv="source venv/bin/activate"
alias brewup='brew update; brew upgrade; brew prune; brew cleanup; brew doctor'


# Commands
# ---
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
export PATH="/Users/strajk/bin:/usr/local/sbin:$PATH"

source "/Users/strajk/.oh-my-zsh/custom/themes/strajk.zsh-theme"

export ZSH_THEME="strajk"
