define(function (require, exports, module) {
	var Extensions = require('ft/core/extensions').Extensions;
	Extensions.addInit(function (editor) {
		editor.addKeyMap({
			'Shift-Cmd-H': 'toggleHighlight'
		});
	});
});
