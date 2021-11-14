/* eslint-env amd */

define(function (require, exports, module) {
  var Extensions = require("ft/core/extensions").Extensions
  var Dom = require("ft/util/dom")
  // UserDefaults = require('ft/core/userdefaults'),
  var focusClass = "jmk-concentrate"

  Extensions.addCommand({
    name: "concentrate",
    description: "Narrow your focus to the current sentence",
    performCommand: function (editor) {
      // userDefaults.setStringForKey('testing', 'mykey');
      // userDefaults.stringForKey()
      Dom.toggleClass(document.body, focusClass)
      editor.refresh()
    },
  })

  Extensions.add("com.foldingtext.editor.init", function (editor) {
    editor.addKeyMap({
      "Cmd-P": "concentrate",
    })
  })
})
