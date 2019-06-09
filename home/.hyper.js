module.exports = {
  config: {
    updateChannel: 'stable',
    fontSize: 12,
    fontFamily: 'Hack, Menlo, "DejaVu Sans Mono", Consolas, "Lucida Console", monospace',

    cursorShape: 'BEAM',
    cursorBlink: true,
    padding: '8px 10px',
    shellArgs: ['--login'],
    env: {},
    bell: 'SOUND',
    copyOnSelect: false
  },

  plugins: [
    'hypercwd',
    'hyperterm-1password',
    'hyperterm-paste',
    'hyperterm-tabs',
    'hyperlinks',
    'hyper-search',
    'hyper-snazzy' // theme
  ],

  keymaps: {}
};
