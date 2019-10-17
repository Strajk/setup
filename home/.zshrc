# Profiling (Part 1/2) - uncomment to profile startup time
# zmodload zsh/zprof

# Secrets
# ---
source $HOME/.secrets

export ZSH=$HOME/.oh-my-zsh

### Cowardly disabled all plugins to improve startup time
# export NVM_DIR=$HOME/.nvm

# hstr
# https://github.com/dvorka/hstr
# ---
export HISTFILE=$HOME/.zsh_history
export HH_CONFIG=hicolor


# Plugins
# ---
### Cowardly disabled all plugins to improve startup time
# plugins=(git git-flow github brew osx ruby rbenv git-extras)


# Action!
# ---
source $ZSH/oh-my-zsh.sh

### Cowardly disabled all plugins to improve startup time
# source $(brew --prefix nvm)/nvm.sh


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

# Set Spaceship ZSH as a prompt
autoload -U promptinit; promptinit

eval "$(direnv hook zsh)"

prompt spaceship

# Profiling (Part 2/2) - uncomment to profile startup time
# zprof
