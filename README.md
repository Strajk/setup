<center>
<h1>Setup</h1>
</center>

## Preparation

#### Clone this repo

`git clone https://github.com/Strajk/setup.git $HOME/Code/setup`

#### Link dotfiles

`ln -s $HOME/Code/setup/home/* $HOME`

#### Install Homebrew

`/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`

#### Install everything from [`~/Brewfile`](home/Brewfile)

`brew bundle` **Just wait & enter password when prompted.**


#### Launch 1Password

Select iCloud as Sync option.

#### Launch Amphetamine

Enable it to prevent Mac from sleeping during syncing Dropbox in the next step.

#### Launch Dropbox

Let it sync completely before continuing to the next steps.

#### Sync Home folder

`ln -s ~/Dropbox/Sync/home/.* $HOME`

#### Repair permission

```bash
sudo chmod og-rw ~/.netrc
sudo chmod 0400 ~/.ssh/*
sudo chmod 0644 ~/.ssh/*.pub
```

#### Accept XCode License

`sudo xcodebuild -license accept`

<center>
  <hr />
  <strong>Continue with setting up apps, one by one</strong>
  <hr />
</center>

## Dev environment

### Node

```bash
# List latest version of Node
nvm ls-remote | tail

# Install it (it should use it & set as default automatically)
nvm install v12.4.0

# Make sure
nvm list
nvm current
```

Global packages

```bash
npm i -g node-inspector
npm i -g browser-sync
npm i -g speed-test
npm i -g eslint
npm i -g @vue/cli
npm i -g jest
npm i -g yo
npm i -g generator-express
npm i -g spaceship-prompt
```

### Ruby

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

## General utilities

### [Hyper](https://hyper.is/)

ℹ️ Electron-based terminal, easy configuration in one file, plugins in JavaScript.

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "hyper"
```

</details>

⚙️ Preferences: [`~/.hyper.js`](`./home/.hyper.js`)


### [Oh-my-zsh](http://ohmyz.sh)

```bash
sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
rm -f "$HOME/.zshrc" && ln -s "$HOME/Code/setup/home/.zshrc" $HOME && source $HOME/.zshrc 
```

## Utilities

### [Dropbox](https://www.dropbox.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "dropbox"
```

</details>

<details><summary> ⚙️ Preferences: manual</summary>

* Do not link work account
* Disable Screenshots
* Disable Photos

</details>

### [Keyboard maestro](http://www.keyboardmaestro.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "keyboard-maestro"
```

</details>

<details><summary> ⚙️ Preferences: `~/Dropbox/Sync/apps/Keyboard Maestro Macros.kmsync`</summary>

* Enable Launch at login
* Enable "Include Conflict Palette in Touch Bar" 

</details>

TODO: Share some generally useful macros

### [Docker](https://www.docker.com/products/docker-desktop)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "docker"
```

</details>

### [Ngrok](https://ngrok.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "ngrok"
```

</details>

### [Keybase](https://keybase.io/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "keybase"
```

</details>

<details><summary> ⚙️ Preferences: Manual</summary>

- Enable Keybase in Finder

</details>

### [1Password](https://agilebits.com/onepassword)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "1password"
```

</details>

<details><summary> ⚙️ Preferences</summary>

- Security: Disable all auto-locking {>> I believe in OS security :) <<}
- Security: Enable automatic unlock
- Browsers: Install Browsers Extensions (Safari, Chrome, Firefox)
- Logins: Disable automatically submitting after filling
- Set keyboard shortcut for Showing 1Password mini
- Set keyboard shortcut for Filling login

</details>

### [Karabiner](https://pqrs.org/osx/karabiner/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "karabiner-elements"
```

</details>

<details><summary> ⚙️ Preferences: manual</summary>

- CapsLock -> f19
- Quit application by pressing command-q twice

</details>

### [NordVPN](https://nordvpn.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
mas "NordVPN", id: 1116599239
```

</details>

### [FortiClient](https://www.forticlient.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "forticlient"
```

</details>

### [HyperSwitch](https://bahoom.com/hyperswitch)

<details><summary> 💾 Installation: Installed via Homebrew (⚠ requires manual post-install)</summary>

```bash <!-- >home/Brewfile#apps -->
cask "hyperswitch"
```

</details>

<details><summary> ⚙️ Preferences</summary>

- Run HyperSwitch in the background
- Use Include windows from other spaces
- Use Include windows from other screens
- Use shift to cycle backwards

</details> 

### [Alfred](https://www.alfredapp.com/)

<details><summary> 💾 Installation</summary>

```bash <!-- >home/Brewfile#apps -->
cask "alfred"
```

</details>

<details><summary> ⚙️ Preferences</summary>

- Set preferences syncing to `~/Dropbox/Sync/apps/Alfred`
- Set main keyboard shortcut to F19 (not synced)
- Set Clipboard history persistence (not synced)

</details>

#### Workflows

* [Airport Search](http://www.packal.org/workflow/airport-search), [repo](https://github.com/jeeftor/alfredAirports)
* Alfred Maestro, [repo](https://github.com/iansinnott/alfred-maestro) – Run Keyboard Maestro macros
* [Audio Switch](http://www.packal.org/workflow/audio-switch), [repo](https://github.com/sampayo/Alfred-WorkFlows/tree/master/Audio%20Switch) – Switch between audio inputs & outputs
* Bit.ly Link - Generate Bit.ly shortlinks, auth supported
* [Call or SMS contact](http://www.packal.org/workflow/call-or-sms-contact), [repo](https://github.com/amoose136/call_or_sms_contact)
* [Colors](http://www.packal.org/workflow/colors), [repo](https://github.com/TylerEich/Alfred-Extras/tree/master/Workflows) – Color tools
* [Datetime Format Converter](http://www.packal.org/workflow/datetime-format-converter)
* [Encode / Decode](https://www.google.cz/search?q=site%3Apackal.org+Encode+/+Decode+(v1.8))
* [Faker](http://www.packal.org/workflow/alfred-faker)
* [Flush DNS](http://www.packal.org/workflow/flush-dns)
* [GitHub](http://www.packal.org/workflow/github), [repo](https://github.com/gharlan/alfred-github-workflow)
* [GitLab](http://www.packal.org/workflow/gitlab), [repo](https://github.com/lukewaite/alfred-gitlab)
* [Homebrew & Cask for Alfred](http://www.packal.org/workflow/homebrew-and-cask-alfred), [repo](https://github.com/fniephaus/alfred-homebrew)
* [HTTP Status Code](http://www.packal.org/workflow/http-status-codes), [repo](https://github.com/ma3574/alfred-http-status-codes)
* [Install apps](http://www.packal.org/workflow/install-app)
* [Kill Process](http://www.packal.org/workflow/kill-process), [repo](https://github.com/ngreenstein/alfred-process-killer)
* [Look up Lyrics of Current Song on Rap Genius](http://www.packal.org/workflow/find-lyrics-current-song-rap-genius)
* [Lorem Ipsum](http://www.packal.org/workflow/lorem-ipsum)
* [newdoc](http://www.packal.org/workflow/newdoc)
* [NewFile](http://www.packal.org/workflow/newfile)
* [NightShift](http://www.packal.org/workflow/nightshift)
* [Open in Chrome](http://www.packal.org/workflow/alfred-chrome)
* [Package Managers](http://www.packal.org/workflow/package-managers)
* [Packal Updater](http://www.packal.org/workflow/packal-updater)
* [Pocket for Alfred](http://www.packal.org/workflow/pocket-alfred)
* [portkiller](http://www.packal.org/workflow/portkiller)
* Recent Items
* [RecentDownloads](http://www.packal.org/workflow/recentdownloads)
* [Relative Dates](http://www.packal.org/workflow/relative-dates)
* [Resize Image](http://www.packal.org/workflow/resize-image)
* [Restore Moom snapshot](http://www.packal.org/workflow/restore-moom-snapshot)
* [Things](http://www.packal.org/workflow/things)
* [Toggle Wifi](http://www.packal.org/workflow/toggle-wifi)
* ToggleRetinaResolution
* [Urban Dictionary](http://www.packal.org/workflow/urban-dictionary)
* [What's My IP](http://www.packal.org/workflow/whats-my-ip)

#### Workflows wanted

* [SearchLink](https://brettterpstra.com/projects/searchlink/)


<details><summary>Script to get workflows</summary>

```bash
for f in ~/Dropbox/Sync/apps/Alfred/Alfred.alfredpreferences/workflows/**/info.plist
do
	ff=${f%.*}
	name=$(defaults read "$ff" name)
	link="https://www.google.cz/search?q=site%3Apackal.org+${name// /+}"
	echo "– [$name]($link)"
done
```

</details>


#### Snippets
<https://gist.github.com/Strajk/f4cb72e318c531a3ee247ccc10681f8f>

### [AppCleaner](https://freemacsoft.net/appcleaner/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "appcleaner"
```

</details>

<details><summary> ⚙️ Preferences</summary>

* Enable SmartDelete

</details>

### [Moom](https://manytricks.com/moom/)

**Do not install from cask, cannot transfer license**

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
mas "Moom", id: 419330170
```

</details>

<details><summary> ⚙️ Preferences</summary>

```bash
ln -s ~/Dropbox/Sync/apps/moom/com.manytricks.Moom.plist ~/Library/Preferences/com.manytricks.Moom.plist
```

</details>

### [PopClip](https://pilotmoon.com/popclip/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
mas "PopClip", id: 445189367
```

</details>

<details><summary> ⚙️ Preferences</summary>

- Enable Start at Login
- Disable Cut & Copy & Paste Extensions

</details>

Extensions

```bash
curl -O "http://pilotmoon.com/popclip/extensions/ext/{Reminders,GoogleTranslate,Alfred}.popclipextz"
```

TODO: Fix! Open & Install extensions after downloading

### [Monosnap](https://monosnap.com)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
mas "Monosnap", id: 540348655
```

</details>

<details><summary> ⚙️ Preferences</summary>

- Enable `General: Launch at login`
- Enable `Advanced: Autosave to "Pictures" folder`
- Enable `Advanced: Shrink Retina snaps`
- Disable `Interface: Capture area: Add shadow to window`
- Sey `Hotkeys: Capture area` to `control + m`
- Sey `Hotkeys: Record video` to `control + alt + m`
- Sey `Hotkeys: Capture previous area` to `control + shift + m`
- Login to Monosnap account  

</details>

### [Dash](https://kapeli.com/dash)

```bash
cask dash
```

<details><summary> ⚙️ Preferences</summary>

```bash
General: Launch Dash at login
General: Global search shortcut
General: Disable show dock icon
Integration: Alfred, PopClip, TextMate

Cheat: Axios
Cheat: Chrome Developer Tools
Cheat: Docker
Cheat: Dockerfile
Cheat: Git
Cheat: You Might Not Need jQuery
StackOverflow: JavaScript
StackOverflow: TypeScript
User: date-fns
Docset: Bash
Docset: Bootstrap 4
Docset: CSS
Docset: Chai
Docset: Express
Docset: Font Awesome
Docset: HTML
Docset: JavaScript
Docset: Less
Docset: Lo-Dash
Docset: Markdown
Docset: Mocha
Docset: MomentJS
Docset: NodeJS
Docset: Sinon
Docset: Stylus
Docset: TypeScript
Docset: VueJS
Docset: jQuery
```

</details>

### [Marked](http://marked2app.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "Marked"
```

</details>

### [Apple Configurator](https://support.apple.com/apple-configurator)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
mas "Apple Configurator 2", id: 1037126344
```

</details>

### [Amphetamine](https://itunes.apple.com/app/amphetamine/id937984704?mt=12)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
mas "Amphetamine", id: 937984704
```

</details>

<details><summary> ⚙️ Preferences</summary>

- Menu Bar Image Click: Primary: Start/end session | Secondary: Show menu
- Launch Amphetamine at login: yes
- Appearance: Menu Bar image: Coffee Carafe
- Appearance: Lower icon opacity when there is no active session

</details>

### [Transmission](https://transmissionbt.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "transmission"
```

</details>

<details><summary> ⚙️ Preferences</summary>

```bash
# Use `~/Downloads/_INCOMPLETE` to store incomplete downloads
defaults write org.m0k.transmission UseIncompleteDownloadFolder -bool true
defaults write org.m0k.transmission IncompleteDownloadFolder -string "${HOME}/Downloads/_INCOMPLETE"

# Use `~/Downloads` to autoimport .torrent files
defaults write org.m0k.transmission AutoImport -bool true
defaults write org.m0k.transmission AutoImportDirectory -string "${HOME}/Downloads"

# Don’t prompt for confirmation before downloading
defaults write org.m0k.transmission DownloadAsk -bool false
defaults write org.m0k.transmission MagnetOpenAsk -bool false

# Trash original torrent files
defaults write org.m0k.transmission DeleteOriginalTorrent -bool true

# Hide the donate message
defaults write org.m0k.transmission WarningDonate -bool false
# Hide the legal disclaimer
defaults write org.m0k.transmission WarningLegal -bool false

# IP block list.
# Source: https://giuliomac.wordpress.com/2014/02/19/best-blocklist-for-transmission/
defaults write org.m0k.transmission BlocklistNew -bool true
defaults write org.m0k.transmission BlocklistURL -string "http://john.bitsurge.net/public/biglist.p2p.gz"
defaults write org.m0k.transmission BlocklistAutoUpdate -bool true
```

</details>

### [ImageOptim](https://imageoptim.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "imageoptim"
```

</details>

### [Handbrake](https://handbrake.fr/)

Open source video transcoder

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
brew "handbrake"
```

</details>

### [Postman](https://www.getpostman.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "postman"
```

</details>

### [Aerial](https://github.com/JohnCoates/Aerial)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "aerial"
```

</details>

### [Google Drive Sync](https://www.google.com/drive/download/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "google-backup-and-sync"
```

</details>

### [keycastr](https://github.com/sdeken/keycastr)

<details><summary>💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "keycastr"
```

</details>

### [Mouseposé](https://boinx.com/mousepose/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "mousepose"
```

</details>

### [Shortcut Detective](http://www.irradiatedsoftware.com/labs/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "shortcutdetective"
```

</details>

### [ScreenFlow](http://www.telestream.net/screenflow/overview.htm)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "screenflow"
```

</details>

### [Gifox](https://gifox.io/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "gifox"
```

</details>

### Other

```bash
brew install heroku && heroku login
```

## Communication

### [Slack](http://slack.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "slack"
```

</details>

### [Caprine](https://github.com/sindresorhus/caprine)

Elegant Facebook Messenger desktop app

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "caprine"
```

</details>

## Browsers

### [Google Chrome](https://www.google.com/chrome/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "google-chrome"
```

</details>

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


<details><summary>Script to get extensions</summary>

```bash
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

</details>

### [Google Chrome Canary](https://www.google.com/chrome/canary/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "caskroom/versions/google-chrome-canary"
```

</details>

**Enable Developer Tools experiments:**

```bash
* Open DevTools, go to General tab and check Enable source maps
* Open DevTools, go to Experiments tab and check Support for Sass
```

### [Firefox](https://www.mozilla.org/en-US/firefox/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "firefox"
```

</details>

### [Opera](https://www.opera.com)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "opera"
```

</details>

### [Brave](https://brave.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "brave-browser"
```

</details>

### [Tor browser](https://www.torproject.org/download/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "tor-browser"
```

</details>

## Productivity

### [Notion](https://www.notion.so/)

Primary notes app

<details><summary> 💾 Installation</summary>

```bash <!-- >home/Brewfile#apps -->
cask "notion"
```

</details>

### [FoldingText](https://www.foldingtext.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "foldingtext"
```

</details>

### [Skype](https://www.skype.com/)

<details><summary>💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "skype"
```

</details>

<details><summary> ⚙️ Preferences</summary>

* Disable show in menu bar

</details>

### [Table tool](https://github.com/jakob/TableTool)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
mas "Table Tool", id: 1122008420
```

</details>

### [Keynote](https://www.apple.com/keynote/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
mas "Keynote", id: 409183694
```

</details>

### [Things](https://culturedcode.com/)

<details><summary>Installation: Manual</summary>

</details>

<details><summary> ⚙️ Preferences</summary>

* Enable `General: Enable Things URLs`
* Enable `Things Cloud` 
* Set shortcut for Quick Entry to `ctrl + n`
* Enable Calendar Events

</details>

## Create

### [Sketch](https://www.sketch.com/)

Versatile design app

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "sketch"
```

</details>

### [SourceTree](https://www.sourcetreeapp.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "sourcetree"
```

</details>

### [GitUp](http://gitup.co/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "gitup"
```

</details>

### [Webstorm](https://www.jetbrains.com/webstorm/), [Pycharm](https://jetbrains.com/pycharm/), [DataGrip](https://jetbrains.com/datagrip/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
# cask "jetbrains-toolbox" # nope nope nope, lost patience with this piece of crap
cask "webstorm"
cask "pycharm"
cask "datagrip"
```

</details>

<details><summary> ⚙️ Preferences</summary>

All preferences sync with Settings Repository to [private GitLab repo](https://gitlab.com/straaajk/intellij-settings-repository).

Some of the main options:

* Appearance
  * Theme: Darcula
  * Custom font: San Francisco `.SF NS Text`
  * Window Options: Allow merging buttons on dialogs: Disable
* Editor
  * Font: Hack

</details>

#### Plugins

* AceJump
* Codota – ⚠️ not working well yet, but like the idea
* Database Navigator 
* GitToolBox 
* Key Promoter X
* Paste Images into Markdown
* Presentation Assistant
* String Manipulation
* Wallaby
* (plugins installed by default)

### [Visual Studio Code](https://code.visualstudio.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "visual-studio-code"
```

</details> 

Sync via Gist

```bash
ln -s ~/Code/setup/apps/Code/User "$HOME/Library/Application Support/Code/"
```

### [iMovie](https://www.apple.com/imovie/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
mas "iMovie", id: 408981434
```

</details>

### [Final Cut Pro](https://www.apple.com/final-cut-pro/)

<details><summary> 💾 Installation: Manually</summary>

TODO

</details>

### [DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve)

<details><summary> 💾 Installation: Manual</summary>

TODO

</details>

### [XCode](https://developer.apple.com/xcode/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
mas "Xcode", id: 497799835
```

</details>

### [VirtualBox](https://www.virtualbox.org/)

<details><summary>Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "virtualBox"
```

</details>

Accept terms, check [issue](https://github.com/xdissent/ievms/issues/328)

```bash
VBoxManage extpack install /Users/strajk/.ievms/Oracle_VM_VirtualBox_Extension_Pack-5.1.22.vbox-extpack
```

[ievms](https://github.com/xdissent/ievms)

```bash
curl -s https://raw.githubusercontent.com/xdissent/ievms/master/ievms.sh | env IEVMS_VERSIONS="10 11 EDGE" bash
```

### [Charles proxy](https://www.charlesproxy.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "charles"
```

</details>

## Media

### [Movist](http://cocoable.com/)

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
mas "Movist", id: 461788075
```

</details>

### [VLC](http://www.videolan.org/vlc/)

Horrible UI, but haven't found better free video player.

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "vlc"
```

</details>

### [Caption](https://getcaption.co/)

<details><summary>💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "caption"
```

</details>

## Fun

### Boxer

<details><summary> 💾 Installation: Installed via Homebrew</summary>

```bash <!-- >home/Brewfile#apps -->
cask "boxer"
```

</details>



## Other preferences

### Default apps

```bash
# https://superuser.com/a/1092184
duti -s $(osascript -e 'id of app "The Unarchiver"') .rar all
duti -s $(osascript -e 'id of app "The Unarchiver"') .zip all
duti -s $(osascript -e 'id of app "Preview"') .pdf all
duti -s $(osascript -e 'id of app "Movist"') .mp3 all
duti -s $(osascript -e 'id of app "Movist"') .m4b all
duti -s $(osascript -e 'id of app "Movist"') .flac all
duti -s $(osascript -e 'id of app "Movist"') .mp4 all
duti -s $(osascript -e 'id of app "Movist"') .mkv all
duti -s $(osascript -e 'id of app "Movist"') .avi all
duti -s $(osascript -e 'id of app "FoldingText"') .md all
duti -s $(osascript -e 'id of app "Visual Studio Code"') .json all
duti -s $(osascript -e 'id of app "Visual Studio Code"') .nfo all
duti -s $(osascript -e 'id of app "Visual Studio Code"') .txt all
duti -s $(osascript -e 'id of app "Visual Studio Code"') .srt all
duti -s $(osascript -e 'id of app "Table Tool"') .csv all
```

### Customize Dock

```bash
defaults write com.apple.dock persistent-apps -array
for app in \
  "/System/Library/CoreServices/Finder.app" \
  "/Applications/Calendar.app" \
  "spacer" \
  "/Applications/Google Chrome.app" \
  "/Applications/Safari.app" \
  "spacer" \
  "/Applications/Things3.app" \
  "/Applications/Reminders.app" \
  "spacer" \
  "/Applications/iTunes.app" \
  "spacer" \
  "/Applications/Slack.app" \
  "/Applications/Caprine.app" \
  "spacer" \
  "/Applications/Sketch.app" \
  "spacer" \
  "/Applications/WebStorm.app" \
  "/Applications/PyCharm.app" \
  "/Applications/SourceTree.app" \
  "/Applications/Hyper.app" \
  "spacer" \
  "/Applications/App Store.app" \
  "/Applications/System Preferences.app" \
  "spacer" \
  ; do
  if [ "$app" "==" "spacer" ]; then
    defaults write com.apple.dock persistent-apps -array-add '{tile-data={}; tile-type="small-spacer-tile";}'
  else
    defaults write com.apple.dock persistent-apps -array-add "<dict><key>tile-data</key><dict><key>file-data</key><dict><key>_CFURLString</key><string>$app</string><key>_CFURLStringType</key><integer>0</integer></dict></dict></dict>"
  fi
done

killall Dock
```

### MacOS Preferences

#### Manual

* System Preferences – Keyboard – Shortcuts
  * Display: Disable both `Decrease & Increase display brightness`
  * Mission control: Disable `Show Desktop`
  * Screenshots: Disable everything (as I use Monosnap)
  * Services: Disable `Open man Page in Terminal` & `Search man Page Index in Terminal`
  * Spotlight:
    * Remap `Show Spotlight search` -> `⌃⌥⌘Space`
    * Disable `Show Finder search window`
  * Accessibility: Disable everything
   
#### Programmatic

```bash
# Close any open System Preferences panes, to prevent them from overriding settings we’re about to change
osascript -e 'tell application "System Preferences" to quit'

# Use scroll gesture with the Ctrl (^) modifier key to zoom
defaults write com.apple.universalaccess closeViewScrollWheelToggle -bool true
defaults write com.apple.universalaccess HIDScrollZoomModifierMask -int 262144
# Follow the keyboard focus while zoomed in
defaults write com.apple.universalaccess closeViewZoomFollowsFocus -bool true


# Disable the “Are you sure you want to open this application?” dialog
defaults write com.apple.LaunchServices LSQuarantine -bool false

# Menu bar: disable transparency
defaults write NSGlobalDomain AppleEnableMenuBarTransparency -bool false

# Expand save panel by default
defaults write NSGlobalDomain NSNavPanelExpandedStateForSaveMode -bool true
defaults write NSGlobalDomain NSNavPanelExpandedStateForSaveMode2 -bool true

# Expand print panel by default
defaults write NSGlobalDomain PMPrintingExpandedStateForPrint -bool true
defaults write NSGlobalDomain PMPrintingExpandedStateForPrint2 -bool true

# Save to disk (not to iCloud) by default
defaults write NSGlobalDomain NSDocumentSaveNewDocumentsToCloud -bool false

# Disable Resume system-wide
defaults write NSGlobalDomain NSQuitAlwaysKeepsWindows -bool false

# Disable auto-correct
defaults write NSGlobalDomain NSAutomaticSpellingCorrectionEnabled -bool false

# Enable full keyboard access for all controls
defaults write NSGlobalDomain AppleKeyboardUIMode -int 3

# Save screenshots to the desktop
defaults write com.apple.screencapture location -string "$HOME/Desktop"

# Disable shadow in screenshots
defaults write com.apple.screencapture disable-shadow -bool true

# Speedup animations
# More: https://www.defaults-write.com/increase-the-speed-of-os-x-dialogs-boxes/
defaults write NSGlobalDomain NSWindowResizeTime .1

# Finder
# ---

# Default folder to $HOME
# TODO: strajk -> dynamic
defaults write com.apple.finder NewWindowTarget -string "PfHm"
defaults write com.apple.finder NewWindowTargetPath -string "file://${HOME}"

# Use column view in all Finder windows by default
defaults write com.apple.Finder FXPreferredViewStyle -string "clmv"

# Show the ~/Library folder.
chflags nohidden ~/Library

# Allow quitting Finder via ⌘ + Q; doing so will also hide desktop icons
defaults write com.apple.finder QuitMenuItem -bool true

# Show status bar in Finder
defaults write com.apple.finder ShowStatusBar -bool true

# Show hidden files by default
defaults write com.apple.Finder AppleShowAllFiles -bool true

# Show all filename extensions
defaults write NSGlobalDomain AppleShowAllExtensions -bool true

# Disable the warning when changing a file extension
defaults write com.apple.finder FXEnableExtensionChangeWarning -bool false

# Allow text selection in Quick Look
defaults write com.apple.finder QLEnableTextSelection -bool true

# When performing a search, search the current folder by default
defaults write com.apple.finder FXDefaultSearchScope -string "SCcf"

# Avoid creating .DS_Store files on network & USB volumes
defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool true
defaults write com.apple.desktopservices DSDontWriteUSBStores -bool true

# Disable disk image verification
defaults write com.apple.frameworks.diskimages skip-verify -bool true
defaults write com.apple.frameworks.diskimages skip-verify-locked -bool true
defaults write com.apple.frameworks.diskimages skip-verify-remote -bool true

# Disable the warning before emptying the Trash
defaults write com.apple.finder WarnOnEmptyTrash -bool false

# Expand the following File Info panes:
# “General”, “Open with”, and “Sharing & Permissions”
defaults write com.apple.finder FXInfoPanesExpanded -dict \
	General -bool true \
	OpenWith -bool true \
	Privileges -bool true


# Other
# ---

# Set the icon size of Dock items to 36 pixels
defaults write com.apple.dock tilesize -int 36

# Trackpad: enable tap to click for this user and for the login screen
defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad Clicking -bool true
defaults -currentHost write NSGlobalDomain com.apple.mouse.tapBehavior -int 1
defaults write NSGlobalDomain com.apple.mouse.tapBehavior -int 1

# Disable dashboard
defaults write com.apple.dashboard mcx-disabled -boolean true

# Disable the crash reporter
defaults write com.apple.CrashReporter DialogType -string "none"
```

TODO:

- Dock: Lock Dock Content
- Dock: Lock icon size
- Disable CapsLock
- Tap to click


## Auto-launched items

```
# launchctl list | egrep -v "com\.apple\."
```

* 1Password
* Alfred
* Amphetamine
* AppCleaner-SmartDelete
* Docker
* Dropbox
* FortiClient VPN
* Gifox
* Google Drive
* HyperSwitch
* Karabiner
* Keybase
* KeyboardMaestro
* Monosnap
* Moom
* PopClip
* RescueTime
* Things
* WebAlert

---
---
---

# Inbox

```
ln -s $HOME/Code/setup/snippets "$HOME/Library/Application Support/Code/User/"

TODO
# Vill Q
# TeamViewer
# Paparazzi!
# zoom.us
# Marked 2
# Insomnia
```

---
---
---

Run regularly

`brewup`

Clone all my repos

```
curl -u strajk -s https://api.github.com/users/strajk/repos?per_page=200 | ruby -rubygems -e 'require "json"; JSON.load(STDIN.read).each { |repo| %x[git clone #{repo["ssh_url"]} ]}'
```

---
---
---

## Fonts

#### Sans-serif

- [Open Sans](https://fonts.google.com/specimen/Open+Sans)
- [Roboto](https://fonts.google.com/specimen/Roboto)

#### Monospace

- [Hack](https://sourcefoundry.org/hack/)
- [Roboto Mono](https://fonts.google.com/specimen/Roboto+Mono)
- [Source Code Pro](https://fonts.google.com/specimen/Source+Code+Pro)

<details><summary> 💾 Installation</summary>

```bash <!-- >home/Brewfile#fonts -->
cask "caskroom/fonts/font-open-sans"
cask "caskroom/fonts/font-roboto"

cask "caskroom/fonts/font-hack"
cask "caskroom/fonts/font-roboto-mono"
cask "caskroom/fonts/font-source-code-pro"
```

</details>
