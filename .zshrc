# TODO: Clean this whole mess one day

export ZSH=$HOME/.oh-my-zsh

export LANG=en_US.UTF-8
export LANGUAGE=en_US.UTF-8
export LC_ALL=en_US.UTF-8

export NVM_DIR=~/.nvm

export ZSH_THEME="theunraveler"

# hstr
# https://github.com/dvorka/hstr
# ---
export HISTFILE=~/.zsh_history
export HH_CONFIG=hicolor


# Plugins
# ---
plugins=(git git-flow github brew osx work virtualenv virtualenvwrapper nvm ruby rbenv git-extras git-extra-commands)

eval "$(pyenv init -)"


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
export PATH="/usr/local/sbin:$PATH"