# Setup

## Inbox

```
ln -s $HOME/Code/setup/snippets "$HOME/Library/Application Support/Code/User/"
```

## Run regularly

### Week
```
brew upgrade
brew cleanup
``` 

## Meta
```
git clone https://github.com/Strajk/setup.git $HOME/Code/setup
# should prompt to install developer tools
ln -s $HOME/Code/setup/home/.* $HOME
```

## Package manager

[Homebrew](http://brew.sh) for packages, [Homebrew-cask](https://caskroom.github.io/) for apps.

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew bundle # install everything from ~/Brewfile

brew services start postgresql
brew services start rabbitmq
brew services start redis
sudo brew services start dnsmasq

brew services list
```

**!!! Wait for Dropbox to completely sync before next steps !!! Needed for syncing of succeeding apps.**

## Sync Home folder

Dotfiles

```bash
ln -s ~/Dropbox/Sync/home/.* $HOME
chmod og-rw ~/.netrc
```

_(Syncying `.zshrc` is covered later, after installing `oh-my-zsh`)_

Repair `.ssh` permissions

```bash
sudo chmod 0600 ~/.ssh/*
sudo chmod 0644 ~/.ssh/*.pub
```

## OS X Preferences

```bash
 # Use column view in all Finder windows by default
defaults write com.apple.Finder FXPreferredViewStyle -string "clmv"
 # Show the ~/Library folder.
chflags nohidden ~/Library
 # Disable the “Are you sure you want to open this application?” dialog
defaults write com.apple.LaunchServices LSQuarantine -bool false
 # Menu bar: disable transparency
defaults write NSGlobalDomain AppleEnableMenuBarTransparency -bool false
 # Expand save panel by default
defaults write NSGlobalDomain NSNavPanelExpandedStateForSaveMode -bool true
 # Expand print panel by default
defaults write NSGlobalDomain PMPrintingExpandedStateForPrint -bool true
 # Save to disk (not to iCloud) by default
defaults write NSGlobalDomain NSDocumentSaveNewDocumentsToCloud -bool false
 # Disable Resume system-wide
defaults write NSGlobalDomain NSQuitAlwaysKeepsWindows -bool false
 # Disable auto-correct
defaults write NSGlobalDomain NSAutomaticSpellingCorrectionEnabled -bool false
 # Allow quitting Finder via ⌘ + Q; doing so will also hide desktop icons
defaults write com.apple.finder QuitMenuItem -bool true
 # Show status bar in Finder
defaults write com.apple.finder ShowStatusBar -bool true
 # Enable full keyboard access for all controls
defaults write NSGlobalDomain AppleKeyboardUIMode -int 3
 # Save screenshots to the desktop
defaults write com.apple.screencapture location -string "$HOME/Desktop"
 # Disable shadow in screenshots
defaults write com.apple.screencapture disable-shadow -bool true
 # Finder: show hidden files by default
defaults write com.apple.Finder AppleShowAllFiles -bool true
 # Finder: show all filename extensions
defaults write NSGlobalDomain AppleShowAllExtensions -bool true
 # Finder: allow text selection in Quick Look
defaults write com.apple.finder QLEnableTextSelection -bool true
 # When performing a search, search the current folder by default
defaults write com.apple.finder FXDefaultSearchScope -string "SCcf"
 # Avoid creating .DS_Store files on network volumes
defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool true
 # Disable the warning before emptying the Trash
defaults write com.apple.finder WarnOnEmptyTrash -bool false
 # Set the icon size of Dock items to 36 pixels
defaults write com.apple.dock tilesize -int 36
 # Trackpad: enable tap to click for this user and for the login screen
defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad Clicking -bool true
defaults -currentHost write NSGlobalDomain com.apple.mouse.tapBehavior -int 1
defaults write NSGlobalDomain com.apple.mouse.tapBehavior -int 1
 # Disable dashboard
defaults write com.apple.dashboard mcx-disabled -boolean true
```

### Automate:

- Dock: Lock Dock Content
- Dock: Lock icon size
- Disable CapsLock
- Tap to click

## All my repos

```
curl -u strajk -s https://api.github.com/users/strajk/repos?per_page=200 | ruby -rubygems -e 'require "json"; JSON.load(STDIN.read).each { |repo| %x[git clone #{repo["ssh_url"]} ]}'
```

## Oh-my-zsh

[ohmyz.sh](http://ohmyz.sh)

```bash
sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

Replace `custom` folder with synced from Dropbox:

```bash
rm -rf "$HOME/.oh-my-zsh/custom" && ln -s "$HOME/Code/setup/home/.oh-my-zsh/custom" "$HOME/.oh-my-zsh/custom"
```

Replace `.zshrc` with my synced from Dropbox:

```bash
rm -f "$HOME/.zshrc" && ln -s "$HOME/Code/setup/.zshrc" $HOME
```

## Node

node

```bash
# List latest version of Node
nvm ls-remote | tail

# Install it
nvm install v5.7.0

# Use it and set it as default
nvm use v5.7.0
nvm alias default v5.7.0

# Make sure
nvm list
nvm current
```

Global packages

```bash
npm i -g grunt-cli
npm i -g node-inspector
npm i -g browser-sync
npm i -g elm elm-format
npm i -g speed-test
```

Meteor

```bash
curl https://install.meteor.com/ | sh
```

## Ruby

! Do not install rbenv via **homebrew**, didn't work for me and already spent more than a lot time debugging.

```bash
git clone git://github.com/sstephenson/rbenv.git ~/.rbenv
git clone git://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build

# check if rbenv plugin is enabled in .zshrc

rbenv install --list
rbenv install 2.4.0 (or newer version)
rbenv rehash
rbenv global 2.4.0
```

if `BUILD FAILED` error occurs, run `xcode-select --install` - installs XCode Command line tools to `/Library/Developer/CommandLineTools/`

# Apps

## Utilities

### [Keyboard maestro](http://www.keyboardmaestro.com/)

```bash
brew cask install keyboard-maestro
```

Enable sync, from `~/Dropbox (Personal)/Sync/apps/Keyboard Maestro Macros.kmsync`

### [Ngrok](https://ngrok.com/)

```
brew cask install ngrok
```

### [Keybase](https://keybase.io/)

```
brew cask install keybase
```

### [keycastr](https://github.com/sdeken/keycastr)

```
brew cask install keycastr
```


### [1Password](https://agilebits.com/onepassword)

```
brew cask install 1password
```

```bash
**Pref:** Security: Disable all auto-locking {>> I believe in OS security :) <<}
**Pref:** Security: Enable automatic unlock
**Pref:** Browsers: Install Browsers Extensions (Safari, Chrome, Firefox)
**Pref:** Logins: Disable automatically submitting after filling
**Pref:** Set keyboard shortcut for Showing 1Password mini
**Pref:** Set keyboard shortcut for Filling login
```

### [HyperSwitch](https://bahoom.com/hyperswitch)

```bash
brew cask install hyperswitch
```

Preferences

```bash
[x] Run HyperSwitch in the background
[x] Use shift to cycle backwards
```

### [Alfred](https://www.alfredapp.com/)

```
brew cask install alfred
```

#### Workflows
* [DenteAzul](https://www.google.cz/search?q=site%3Apackal.org+DenteAzul)
* [Call or SMS contact](https://www.google.cz/search?q=site%3Apackal.org+Call+or+SMS+contact)
* [RecentDownloads](https://www.google.cz/search?q=site%3Apackal.org+RecentDownloads)
* [Airport Search](https://www.google.cz/search?q=site%3Apackal.org+Airport+Search)
* [Reading List](https://www.google.cz/search?q=site%3Apackal.org+Reading+List)
* [Resize Image](https://www.google.cz/search?q=site%3Apackal.org+Resize+Image)
* [Restore Moom snapshot](https://www.google.cz/search?q=site%3Apackal.org+Restore+Moom+snapshot)
* [Toggle Wifi](https://www.google.cz/search?q=site%3Apackal.org+Toggle+Wifi)
* [pinboard](https://www.google.cz/search?q=site%3Apackal.org+pinboard)
* [Faker](https://www.google.cz/search?q=site%3Apackal.org+Faker)
* [Encode / Decode (v1.8)](https://www.google.cz/search?q=site%3Apackal.org+Encode+/+Decode+(v1.8))
* [ToggleRetinaResolution](https://www.google.cz/search?q=site%3Apackal.org+ToggleRetinaResolution)
* [GitHub](https://www.google.cz/search?q=site%3Apackal.org+GitHub)
* [Homebrew & Cask for Alfred](https://www.google.cz/search?q=site%3Apackal.org+Homebrew+&+Cask+for+Alfred)
* [NotePlan Workflow](https://www.google.cz/search?q=site%3Apackal.org+NotePlan+Workflow)
* [NightShift](https://www.google.cz/search?q=site%3Apackal.org+NightShift)
* [Datetime Format Converter](https://www.google.cz/search?q=site%3Apackal.org+Datetime+Format+Converter)
* [FormatSize](https://www.google.cz/search?q=site%3Apackal.org+FormatSize)
* [Top](https://www.google.cz/search?q=site%3Apackal.org+Top)
* [TimeZones](https://www.google.cz/search?q=site%3Apackal.org+TimeZones)
* [npms](https://www.google.cz/search?q=site%3Apackal.org+npms)
* [LinkClean](https://www.google.cz/search?q=site%3Apackal.org+LinkClean)
* [Amphetamine Switch](https://www.google.cz/search?q=site%3Apackal.org+Amphetamine+Switch)
* [Numi](https://www.google.cz/search?q=site%3Apackal.org+Numi)
* [GitLab](https://www.google.cz/search?q=site%3Apackal.org+GitLab)
* [What's My IP](https://www.google.cz/search?q=site%3Apackal.org+What's+My+IP)
* [Packal Updater](https://www.google.cz/search?q=site%3Apackal.org+Packal+Updater)
* [NewFile](https://www.google.cz/search?q=site%3Apackal.org+NewFile)
* [Install apps [1.11]](https://www.google.cz/search?q=site%3Apackal.org+Install+apps+[1.11])
* [Kill Process](https://www.google.cz/search?q=site%3Apackal.org+Kill+Process)
* [Flush DNS](https://www.google.cz/search?q=site%3Apackal.org+Flush+DNS)
* [RespondQuickly](https://www.google.cz/search?q=site%3Apackal.org+RespondQuickly)
* [Source Tree](https://www.google.cz/search?q=site%3Apackal.org+Source+Tree)
* [Pocket for Alfred](https://www.google.cz/search?q=site%3Apackal.org+Pocket+for+Alfred)
* [Relative Dates](https://www.google.cz/search?q=site%3Apackal.org+Relative+Dates)

###### Script to get workflows
```bash
for f in ~/Dropbox\ \(Personal\)/Sync/apps/Alfred/Alfred.alfredpreferences/workflows/**/info.plist
do
	ff=${f%.*}
	name=$(defaults read "$ff" name)
	link="https://www.google.cz/search?q=site%3Apackal.org+${name// /+}"
	echo "* [$name]($link)"
done
```


#### Preferences

```bash
Set keyboard shortcuts (not synced)
Advanced: Syncing from ~/Dropbox/Alfred
Clipboard history persistent for 1 month
```

#### Snippets
<https://gist.github.com/Strajk/f4cb72e318c531a3ee247ccc10681f8f>


### [AppCleaner](https://freemacsoft.net/appcleaner/)

```
brew cask install appcleaner
```

### [Moom](https://manytricks.com/moom/)

**Do not install from cask, cannot transfer license**

```bash
mas install `mas search moom | awk '{ print $1 }'`
```

Preferences

```bash
ln -s ~/Dropbox/Sync/apps/moom/com.manytricks.Moom.plist ~/Library/Preferences/com.manytricks.Moom.plist
```

### [PopClip](https://pilotmoon.com/popclip/)

```
mas install `mas search popclip | awk '{ print $1 }'`
```

Preferences

```bash
**Pref:** Disable Cut & Copy & Paste Extensions
```

Extensions

```bash
curl -O "http://pilotmoon.com/popclip/extensions/ext/{Say,Reminders,GoogleTranslate,Alfred,Dash}.popclipextz"
```

TODO: Open & Install extensions after downloading

### [Monosnap](https://monosnap.com)

```bash
mas install `mas search monosnap | awk '{ print $1 }'`
```

### RecordIt

```bash
brew cask install recordit
```

### [Dash](https://kapeli.com/dash)

```bash
brew cask install dash3
```

Preferences - **TODO: Automate**

```bash
General: Launch Dash at login
General: Global search shortcut
General: Disable show dock icon
Downloads: Bootstrap, BackboneJS, CoffeeScript, CSS, Git, HTML, jQuery, Mac OS X, R, Ruby 2, Ruby on Rails 3, Ruby on Rails 4
Docsets
Integration: Alfred, PopClip, TextMate
```

### Markdown preview: [Marked](http://marked2app.com/)

```bash
brew cask install marked
```

### Messaging: Facebook Messenger: [Caprine](https://github.com/sindresorhus/caprine)

Elegant Facebook Messenger desktop app

```bash
brew cask install caprine
```

### Messaging: [Slack](http://slack.com/)


```bash
brew cask install slack
```


## Browsers

### Google Chrome

```bash
brew cask install google-chrome
```

#### Extensions

* [1Password](https://chrome.google.com/webstore/detail/aomjjhallfgjeglblehebfpbcfeobpgk) - password manager
* [AngularJS Batarang](https://chrome.google.com/webstore/detail/ighdmehidhipcmcojjgiloacoafjmpfk) - Angular dev tools
* [Augury](https://chrome.google.com/webstore/detail/elgalmkoelokbchhkhacckoklkejnhcd) - Angular2 dev tools
* [Better History](https://chrome.google.com/webstore/detail/obciceimmggglbmelaidpjlmodcebijb)
* [Check My Links](https://chrome.google.com/webstore/detail/ojkcdipcgfaekbeaelaapakgnjflfglf)
* [Diigo](https://chrome.google.com/webstore/detail/pnhplgjpclknigjpccbcnmicgcieojbh) - Highlight & annotate
* [Dropmark](https://chrome.google.com/webstore/detail/foiapgoppijipmmgkaibacckkhbngfhp) - collecting inspiration
* [Frame by Frame](https://chrome.google.com/webstore/detail/elkadbdicdciddfkdpmaolomehalghio)
* [Google Dictionary](https://chrome.google.com/webstore/detail/mgijmajocgfcbeboacabfgobmjgjcoja)
* [Grammarly](https://chrome.google.com/webstore/detail/kbfnbcaeplbcioakkpcpgfkobkghlhen) - Check grammmar
* [Imagus](https://chrome.google.com/webstore/detail/immpkjjlgappgfkkfieppnmlhakdmaab) - Enlarge thumbnails
* [Immutable.js Object Formatter](https://chrome.google.com/webstore/detail/hgldghadipiblonfkkicmgcbbijnpeog)
* [IntelliOcto](https://chrome.google.com/webstore/detail/hbkpjkfdheainjkkebeoofkpgddnnbpk)
* [JSONView](https://chrome.google.com/webstore/detail/chklaanhfefbnpoihckbnefhakgolnmc)
* [Keyboard Shortcuts to Reorder Tabs](https://chrome.google.com/webstore/detail/moigagbiaanpboaflikhdhgdfiifdodd)
* [Linkclump](https://chrome.google.com/webstore/detail/lfpjkncokllnfokkgpkobnkbkmelfefj)
* [Multi-highlight](https://chrome.google.com/webstore/detail/pfgfgjlejbbpfmcfjhdmikihihddeeji)
* [npmhub](https://chrome.google.com/webstore/detail/kbbbjimdjbjclaebffknlabpogocablj)
* [OctoLinker](https://chrome.google.com/webstore/detail/jlmafbaeoofdegohdhinkhilhclaklkp)
* [Octotree](https://chrome.google.com/webstore/detail/bkhaagjahfmjljalopjnoealnfndnagc)
* [Pesticide for Chrome](https://chrome.google.com/webstore/detail/bblbgcheenepgnnajgfpiicnbbdmmooh)
* [Pinboard Plus](https://chrome.google.com/webstore/detail/mphdppdgoagghpmmhodmfajjlloijnbd)
* [Postman Interceptor](https://chrome.google.com/webstore/detail/aicmkgpgakddgnaphhhpliifpcfhicfo)
* [Postman](https://chrome.google.com/webstore/detail/fhbjgbiflinjbdggehcddcbncdddomop)
* [Project Naptha](https://chrome.google.com/webstore/detail/molncoemjfmpgdkbdlbjmhlcgniigdnf) - OCR
* [React Developer Tools](https://chrome.google.com/webstore/detail/fmkadmapgofadopljbjfkapdkoienihi)
* [React Perf](https://chrome.google.com/webstore/detail/hacmcodfllhbnekmghgdlplbdnahmhmm)
* [Reddit Enhancement Suite](https://chrome.google.com/webstore/detail/kbmfpngjjgdllneeigpgjifpgocmfgmb)
* [Redux DevTools](https://chrome.google.com/webstore/detail/lmhkpmbekcpmknklioeibfkpmmfibljd)
* [Refined Trello](https://chrome.google.com/webstore/detail/ehplgncidablicleelajoojipdnclbhm)
* [SelectorGadget](https://chrome.google.com/webstore/detail/mhjhnkcfbdhnjickkkdbjoemdmbfginb)
* [Shortkeys](https://chrome.google.com/webstore/detail/logpjaacgmcbpdkdchjiaagddngobkck)
* [Stylish](https://chrome.google.com/webstore/detail/fjnbnpbmkenffdnngjfgmeleoegfcffe) - Custom CSS
* [Tampermonkey](https://chrome.google.com/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo) - Custom JS
* [tlda](https://chrome.google.com/webstore/detail/ogefhmcfhgggggefddkaemfifdcljbml)
* [uBlock Origin](https://chrome.google.com/webstore/detail/cjpalhdlnbpafiamejdnhcphjbkeiagm)
* [Vue.js devtools](https://chrome.google.com/webstore/detail/nhdogjmejiglipccpnnnanhbledajbpd)
* [Youtube Playback Speed Control](https://chrome.google.com/webstore/detail/hdannnflhlmdablckfkjpleikpphncik)


#### Script to get list of extensions

```
# run at chrome://extensions
output = []
document.querySelectorAll(".extension-details").forEach(el => {
    var title = el.querySelector(".extension-title").textContent.trim()
    var id = el.querySelector(".extension-id").textContent.trim()
    var link = `https://chrome.google.com/webstore/detail/${id}`
    output.push(`* [${title}](${link})`)
})
copy(output.join("\n"))
```


### Google Chrome Canary

```bash
brew cask install caskroom/versions/google-chrome-canary
```

**Enable Developer Tools experiments:**

```bash
* Open DevTools, go to General tab and check Enable source maps
* Open DevTools, go to Experiments tab and check Support for Sass
```

### Firefox

```bash
brew cask install firefox
```

## Productivity

### Things

```bash
mas install `mas search things | awk '{ print $1 }'`
```

### Evernote

```bash
brew cask install evernote
```

Preferences

```bash
**Pref:** General: Keep Evernote Helper running
**Pref:** General: Show Elephant in Menubar
**Pref:** General: Start the Evernote Helper when I log in to my computer
**Pref:** Remove all keyboard shotcuts (colliding)
```

### Skype

```
brew cask install skype
```

```bash
Disable show in menu bar
```

## Create

### Versatile design app: Sketch

```bash
brew cask install sketch
```

### Adobe Creative Cloud: [Photoshop](https://www.adobe.com/products/photoshop.html), [Illustrator](https://www.adobe.com/products/illustrator.html), [Lightroom](https://www.adobe.com/products/photoshop-lightroom.html)

```bash
brew cask install adobe-creative-cloud
/usr/local/Caskroom/adobe-creative-cloud/latest/Creative Cloud Installer.app
```

Sync settings of Illustrator

```bash
rm -rf "$HOME/Library/Preferences/Adobe Illustrator CS6 Settings/en_US/Workspaces"
ln -s "$HOME/Dropbox/Sync/Illustrator/Workspaces" "$HOME/Library/Preferences/Adobe Illustrator CS6 Settings/en_US/"
```

Sync settings for Photoshop

```bash
rm -rf "$HOME/Library/Preferences/Adobe Photoshop CC 2014 Settings/WorkSpaces"
ln -s "$HOME/Dropbox/Sync/Photoshop/WorkSpaces" !:2
rm -rf "$HOME/Library/Application Support/Adobe/Adobe Photoshop CS6/Presets"
ln -s "$HOME/Dropbox/Sync/Photoshop/Presets" !:2
```

Plugins for Illustrator <http://astutegraphics.com>

Customize Photoshop

```bash
`⌘ + k` to open Preferences
Turn off Animated zoom
Turn off Enable Flick Panning
Maximize PSD and PSB Files: Never
```

Plugins for Photoshop:

- <http://guideguide.me>
- <http://imagenomic.com/pt.aspx>
- <http://www.cutandslice.me>
- <http://lumens.se/tychpanel/>
- Enigma64 <http://getenigma64.com>
- <http://blog.kam88.com/en/expanding-smart-objects-script.html>
- <http://blog.kam88.com/en/lighten-darken-color-script.html>
- <http://blog.kam88.com/en/transform-each-beta-script.html>

Photoshop Lightroom Preferences

```bash
General: Disable Show splash screen during startup
General: Disable Show import dialog when a memory card is detected
Presets: Disable Store presets with this catalog
External Editing: Edit in Adobe Photoshop – change Color Space to AdobeRGB
```

Photoshop Lightroom Presets

- [Trey's Lightroom 5 Presets](http://store.stuckincustoms.com/lightroom-5-presets)

```bash
rm -rf "$HOME/Library/Application Support/Adobe/Lightroom"
ln -s "$HOME/Dropbox/Sync/apps/Lightroom Settings" "$HOME/Library/Application Support/Adobe/Lightroom"
```

Plug-ins `⌥⌘⇧,` to open Plug-in Manager, add:

- [Dev Preset Lab](http://www.robcole.com/Rob/ProductsAndServices/DevPresetLabLrPlugin/)
- [The Fader](http://www.capturemonkey.com/thefader)
- [Preset Ripper](http://www.capturemonkey.com/presetripper)
- [Excessor](http://www.capturemonkey.com/excessor)
- [Focus Mask](http://www.capturemonkey.com/focusmask)

## Dev

### Databases

#### Postgres

```
brew cask install postgres
```

#### Mongo

```
brew install mongodb
mongod --config /usr/local/etc/mongod.conf
```

### Git UI

#### [SourceTree](https://www.sourcetreeapp.com/)

```bash
brew cask install sourcetree
```

#### [GitUp](http://gitup.co/)

```bash
brew cask install gitup
```

### Hardcore IDE: [Webstorm](https://www.jetbrains.com/webstorm/), [Pycharm](https://jetbrains.com/pycharm/)

```bash
brew cask install webstorm-eap
brew cask install pycharm
```

### Versatile text editor: [Atom](https://atom.io)

```bash
brew cask install atom
```

Preferences

```bash
ln -s ~/Dropbox\ \(Personal\)/sync/apps/atom/config.cson ~/.atom/
ln -s ~/Dropbox\ \(Personal\)/sync/apps/atom/keymap.cson ~/.atom/
```

### Database UI: [Navicat](https://www.navicat.com)

```bash
brew cask install navicat-premium
```

### Virtualization: [VirtualBox](https://www.virtualbox.org/)

```bash
brew cask install virtualBox
```

Accept terms, check [issue](https://github.com/xdissent/ievms/issues/328)

```bash
VBoxManage extpack install /Users/strajk/.ievms/Oracle_VM_VirtualBox_Extension_Pack-5.1.22.vbox-extpack
```

[ievms](https://github.com/xdissent/ievms)

```bash
curl -s https://raw.githubusercontent.com/xdissent/ievms/master/ievms.sh | env IEVMS_VERSIONS="10 11 EDGE" bash
```

### [Charles proxy](https://www.charlesproxy.com/)

```bash
brew cask install charles
```

### Other

```bash
brew install heroku-toolbelt && heroku login
```

## Media

### [VLC](http://www.videolan.org/vlc/)

Horrible UI, but haven't found better free video player.

```bash
brew cask install vlc
```

### Subtitles: Caption

```bash
brew cask install caption
```

--------------------------------------------------------------------------------

## Customize Dock

```bash
defaults write com.apple.dock persistent-apps -array
for app in \
  "/Applications/Finder.app" \
  "/Applications/Calendar.app" \
  "/Applications/Safari.app" \
  "/Applications/Mail.app" \
  "/Applications/Reminders.app" \
  "/Applications/Preview.app" \
  "/Applications/Things.app" \
  "/Applications/iTunes.app" \
  "spacer" \
  "/Applications/Sketch.app" \
  "/Applications/Adobe Lightroom/Adobe Lightroom.app" \
  "/Applications/Adobe Photoshop CC 2017/Adobe Photoshop CC 2017.app" \
  "spacer" \
  "/Applications/Atom.app" \
  "/Applications/SourceTree.app" \
  "/Applications/Utilities/Terminal.app" \
  "spacer" \
  "/Applications/App Store.app" \
  "/Applications/System Preferences.app" \
  "spacer" \
  ; do
  if [ "$app" == "spacer" ]; then
    defaults write com.apple.dock persistent-apps -array-add '{tile-data={}; tile-type="spacer-tile";}'
  else
    defaults write com.apple.dock persistent-apps -array-add "<dict><key>tile-data</key><dict><key>file-data</key><dict><key>_CFURLString</key><string>$app</string><key>_CFURLStringType</key><integer>0</integer></dict></dict></dict>"
  fi
done

killall Dock
```

---
---
---

# Offline setup

## Longboard

* [Restless Fishbowl 38](https://www.restlessboards.com/shop/longboards/fishbowl-38-beast-longboard/)
* Trucks: Paris
* Divine 72/78A

## Bike

* [Specialized Carve Expert 29](https://www.specialized.com/se/en/bike-archive/2013/carve/carveexpert/37829)
	* FRAME: Specialized M4SL Aluminum, 29er frame w/ XC geometry
	* FORK: RockShox Reba RL 29", 100mm travel
	* HEADSET: Integrated 1-1/8" upper and 1-1/2" lower threadless, Campy-style, full cartridge bearings
	* STEM: Specialized 3D forged 6061 alloy, 4 bolt clamp, 7º rise, 31.8mm
	* HANDLEBARS: Flat bar, 6061 double butted alloy, 700mm wide, 10º backsweep, 4º upsweep, 31.8mm
	* GRIPS: Specialized Body Geometry XCT, Kraton rubber w/ gel, closed end, 132mm, lock-on
	* FRONT BRAKE: Avid Elixir 3R, hydraulic disc, G2 CleanSweep 180mm rotor
	* REAR BRAKE: Avid Elixir 3R, hydraulic disc, G2 CleanSweep 160mm rotor
	* BRAKE LEVERS: Avid Elixir 3R, hydraulic lever, tool-less reach adjust
	* FRONT DERAILLEUR: SRAM X7, 10-speed 2X10, 34.9mm clamp
	* REAR DERAILLEUR: Shimano Deore XT Shadow, 10-Speed, GS cage
	* SHIFT LEVERS: Shimano Deore, 10-speed Rapidfire plus, SL type
	* CASSETTE: SRAM PG 1030, 10-speed cassette, 11-36
	* CHAIN: KMC X-10, 10-speed w/ reusable Missing Link
	* BOTTOM BRACKET: SRAM GXP BB for 2pc, 73mm shell
	* PEDALS: Alloy 1pc. body and cage, w/ reflectors, 9/16"
	* RIMS: Carve SL Disc, 29", alloy double-wall, sleeve joint, 26mm, 32h
