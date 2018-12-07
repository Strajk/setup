source ./lib/utils

# Homebrew
if ! type_exists 'brew'; then
    e_header "Installing Homebrew..."
    ruby -e "$(curl -fsSkL raw.github.com/mxcl/homebrew/go)"
fi

brew bundle # install everything from ~/Brewfile

# Ignite!
brew services start postgresql
brew services start rabbitmq
brew services start redis
sudo brew services start dnsmasq # TODO

# TODO: Maybe print at the end so it doesn't go unnoticed
brew services list