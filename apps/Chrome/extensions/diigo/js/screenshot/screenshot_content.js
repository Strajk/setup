var isContentScriptLoaded = true;
var doc, html,
	docW, docH,
	initScrollTop, initScrollLeft,
	clientH, clientW;
var scrollBar = {};
var counter = 1; //horizontal scroll counter
var menu = {
	visible: {
		enable: 'false',
		key: 'V'
	},
	selected: {
		enable: 'false',
		key: 'S'
	},
	entire: {
		enable: 'false',
		key: 'E'
	}
};
var fixedElements = [];

var wrapperHTML = '<div id="awesome_screenshot_wrapper"><div id="awesome_screenshot_top"></div><div id="awesome_screenshot_right"></div><div id="awesome_screenshot_bottom"></div><div id="awesome_screenshot_left"></div><div id="awesome_screenshot_center" class="drsElement drsMoveHandle"><div id="awesome_screenshot_size" style="min-width:70px;"><span>0 X 0</span></div><div id="awesome_screenshot_action"><a id="awesome_screenshot_cancel"><span id="awesome_screenshot_cancel_icon"></span>Cancel</a><a id="awesome_screenshot_capture"><span id="awesome_screenshot_capture_icon"></span>Capture</a></div></div></div>';
var wrapper,
	dragresize; //dragresize object
var isSelected = false;
var hostname = document.location.hostname;

var googleSites = ["www.google.com", "www.google.com.hk", "www.google.com.tw", "www.google.co.jp", "www.google.cn", "www.google.co.kr", "www.google.co.th", "www.google.de", "www.google.fr", "www.google.co.uk", "www.google.com.gr", "www.google.com.au", "www.google.ca", "www.google.co.il", "www.google.it", "www.google.ch", "www.google.cl", "www.google.nl", "www.google.be", "www.google.at", "www.google.com.pa", "www.google.pl", "www.google.com.ru", "www.google.com.br", "www.google.co.nz", "www.google.lt", "www.google.com.ar", "www.google.bi", "http://paoniu8.blogbus.com", "www.google.pn", "www.google.li", "www.google.com.nf", "www.google.vg", "www.google.mw", "www.google.fm", "www.google.sh", "www.google.cd", "www.google.ms", "www.google.co.cr", "www.google.lv", "www.google.ie", "www.google.co.gg", "www.google.co.je", "www.google.ae", "www.google.fi", "www.google.com.sg", "www.google.com.pe", "www.google.pr", "www.google.com.py", "www.google.gm", "www.google.td", "www.google.co.hu", "www.google.com.mx", "www.google.pt", "www.google.com.ua", "www.google.co.ve", "www.google.com.tr", "www.google.com.mt", "www.google.com.uy", "www.google.com.np", "www.google.hn", "www.google.com.ni", "www.google.gl", "www.google.kz", "www.google.sm", "www.google.co.mu", "www.google.as", "www.google.rw", "www.google.com.tj"];

var delayInterval = null;


//has class
function hasClass(obj, cls) {
	return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}
//add class
function addClass(obj, cls) {
	if (!hasClass(obj, cls)) obj.className += " " + cls;
}
//remove class
function removeClass(obj, cls) {
	if (hasClass(obj, cls)) {
		var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
		obj.className = obj.className.replace(reg, ' ');
	}
}
//fix position on some page
function fixPosition(host) {
	switch (host) {
		case 'www.facebook.com':
			var bar = document.getElementById("blueBarNAXAnchor");
			removeClass(bar, 'fixed_elem');
			break;
		case 'pinterest.com':
			var bar1 = document.getElementById("CategoriesBar");
			var bar2 = document.getElementsByClassName('Nag');
			if (bar2.length != 0) {
				bar2[0].style.setProperty('position', 'absolute', 'important');
			}
			bar1.style.setProperty('position', 'absolute', 'important');
			break;


	}
}

function restorePosition(host) {
	switch (host) {
		case 'www.facebook.com':
			var bar = document.getElementById("blueBarNAXAnchor");
			addClass(bar, 'fixed_elem');
			break;

		case 'pinterest.com':
			var bar1 = document.getElementById("CategoriesBar");
			var bar2 = document.getElementsByClassName('Nag');
			if (bar2.length != 0) {
				bar2[0].style.position = '';
			}
			bar1.style.position = '';
			break;
	}
}



chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	switch (request.action) {
		case 'update_shortcuts':
			bindShortcuts(request);
			break;
		case 'init_entire_capture':
			initEntireCapture();
			break;
		case 'init_selected_capture':
			initSelectedCapture();
			break;
		case 'scroll_next':
			scrollNext();
			break;
		case 'destroy_selected':
			removeSelected();
			break;
		case 'restorebar':
			restorePosition(hostname);
			restoreFixedElements();
			var searchbar = document.getElementById("searchbar");
			if (searchbar != null) {
				searchbar.style.display = 'block';
				document.body.id = 'searchbarshow';
			}
			break;
			// case 'hidescroll':
			//     var body= document.body;
			//     body.style.overflowY = 'hidden';
			//     break;
			// case 'restorescroll':
			//     var body = document.body;
			//     body.style.overflowY = 'scroll';
			//     break;

		case 'finishAutoSave':
			var message = "The screenshot has been saved in " + request.path + '.';
			notification.show('success', message);
			break;

		case 'tabupdate':
			break;

		case 'delay-capture':
			if (delayInterval !== null) {
				clearInterval(delayInterval);
				delayInterval = null;
				$('#awe_delay_div').remove();
			}
			var $delayDiv = $('<div id="awe_delay_div"><span></span><div id="awe_delay_cancel">Cancel</div></div>')
							/*.css({top: document.body.scrollTop + 20})*/
							.appendTo('body').find('span').text(request.sec).end();

			$delayDiv.find('#awe_delay_cancel').on('click', function() {
				clearInterval(delayInterval);
				delayInterval = null;
				$delayDiv.remove();
			});

			$.Draggable($delayDiv[0], {});

			var sec = request.sec ? request.sec - 1 : 2;
			delayInterval = setInterval(function() {
				if (sec <= 0) {
					clearInterval(delayInterval);
					delayInterval = null;
					$delayDiv.remove();
					setTimeout(function() {
						chrome.extension.sendRequest({
							action: 'visible'
						});
					}, 100);

					return;
				}
				$('#awe_delay_div').find('span').text(sec);
				sec--;
			}, 1000);
			break;

	}
});

function initEntireCapture() {
	fixPosition(hostname);
	enableFixedPosition(true);
	counter = 1;
	getDocumentNode();

	html = doc.documentElement;
	initScrollTop = document.body.scrollTop;
	initScrollLeft = document.body.scrollLeft;
	clientH = getClientH();
	clientW = html.clientWidth;
	//console.log(clientH+' '+clientW);
	document.body.scrollTop = 0;
	document.body.scrollLeft = 0;

	checkScrollBar();
	window.onresize = checkScrollBar; //no need, integrate with selected
	if (!scrollBar.x && !scrollBar.y) {
		sendRequest({
			action: 'visible'
		});
		return;
	}

	//http://help.dottoro.com/ljlskbkk.php
	setTimeout(sendRequest, 300, {
		action: 'scroll_next_done'
	});
}

/************** selected capture start **************/
function initSelectedCapture() {
	//for searchO 
	var searchbar = document.getElementById("searchbar");
	if (searchbar !== null) {
		searchbar.style.display = 'none';
		var body = document.body;
		body.id = '';
	}

	/* var a = $(window).scrollTop();
    $('html').css('overflow', 'hidden');
    $(window).bind('scroll',function(){
     $(window).scrollTop(a);
     return false;

     });

    $('body').addClass('unselectable');*/

	getDocumentNode();
	getDocumentDimension();
	if (!document.getElementById('awesome_screenshot_wrapper')) {
		var newNode = document.createElement("div");
		document.body.appendChild(newNode);
		//doc.body.innerHTML += wrapperHTML;
		newNode.innerHTML += wrapperHTML;
		//console.log(document.getElementById('awesome_screenshot_wrapper'));
		//console.log(doc);
		//console.log('insertDom');
	}



	// wrapper = doc.getElementById('awesome_screenshot_wrapper');
	wrapper = document.getElementById('awesome_screenshot_wrapper');
	//console.log(wrapper);
	updateWrapper();
	window.addEventListener('resize', windowResize, false);
	document.body.addEventListener('keydown', selectedKeyDown, false);
	wrapper.addEventListener('mousedown', wrapperMouseDown, false);
	//alert("here");
}

function wrapperMouseDown(e) {
	if (e.button == 0) {
		var initX = e.pageX,
			initY = e.pageY,
			centerH,
			centerW;
		var asSize = document.getElementById('awesome_screenshot_size');
		var asAction = document.getElementById('awesome_screenshot_action');
		//console.log(asAction);
		wrapper.addEventListener('mousemove', wrapperMouseMove, false);
		wrapper.addEventListener('mouseup', wrapperMouseUp, false);


		function wrapperMouseMove(e) {
			setStyle(wrapper, 'background-color', 'rgba(0,0,0,0)');
			centerW = e.pageX - initX,
			centerH = e.pageY - initY;
			asSize.children[0].innerHTML = Math.abs(centerW) + ' X ' + Math.abs(centerH);

			updateCorners(initX, initY, centerW, centerH);
			updateCenter(initX, initY, centerW, centerH);
			autoScroll(e);
		}

		function wrapperMouseUp(e) {
			if ((e.pageX - initX == 0 || e.pageY - initY == 0) && $('#awesome_screenshot_center').width() == 0) {
				setStyle(wrapper, 'background-color', 'rgba(0,0,0,0)');
				asSize.children[0].innerHTML = Math.abs(200) + ' X ' + Math.abs(200);
				updateCorners(initX - 100, initY - 100, 200, 200);
				updateCenter(initX - 100, initY - 100, 200, 200);
			}

			wrapper.removeEventListener('mousedown', wrapperMouseDown, false);
			wrapper.removeEventListener('mousemove', wrapperMouseMove, false);
			wrapper.removeEventListener('mouseup', wrapperMouseUp, false);
			setStyle(document.getElementById('awesome_screenshot_action'), 'display', 'block');
			setStyle(asSize, 'display', 'block');
			/*var rightoffset = -(195-centerW)/2;
		    if(centerW<190){setStyle(asAction,'right',rightoffset+'px');}
		    else{setStyle(asAction,'right',0+'px');}*/
			bindCenter();
		}
	}
}

function selectedKeyDown(e) {
	if (e.keyCode == 27) removeSelected();
}

function windowResize(e) {
	updateWrapper();
	getDocumentDimension();

	var center = document.getElementById('awesome_screenshot_center');
	var centerW = getStyle(center, 'width'),
		centerH = getStyle(center, 'height');

	if (centerW * centerH) {
		var initX = getStyle(center, 'left'),
			initY = getStyle(center, 'top');
		updateCorners(initX, initY, centerW, centerH);
	}
	//update dragresize area
	dragresize.maxLeft = docW;
	dragresize.maxTop = docH;
	//updateCorners: only right and bottom
	//handle zoom: zoom action invoke window.resize event
}

function bindCenter() {
	var initX, initY, centerW, centerH;
	var center = document.getElementById('awesome_screenshot_center');
	dragresize = new DragResize('dragresize', {
		maxLeft: docW,
		maxTop: docH
	}); // { minWidth: 50, minHeight: 50, minLeft: 20, minTop: 20, maxLeft: 600, maxTop: 600 });
	var asSize = document.getElementById('awesome_screenshot_size');
	var asAction = document.getElementById('awesome_screenshot_action');

	dragresize.isElement = function(elm) {
		if (elm.className && elm.className.indexOf('drsElement') > -1) return true;
	};
	dragresize.isHandle = function(elm) {
		if (elm.className && elm.className.indexOf('drsMoveHandle') > -1) return true;
	};

	dragresize.ondragmove = function(isResize, ev) {
		var x = dragresize.elmX,
			y = dragresize.elmY,
			w = dragresize.elmW,
			h = dragresize.elmH;
		asSize.children[0].innerHTML = Math.abs(w) + ' X ' + Math.abs(h);
		//console.log(y);

		/*y - document.body.scrollTop < 30 ? setStyle(asSize,'top','5px') : setStyle(asSize,'top','-30px');
         (y + h > document.body.scrollTop + window.innerHeight - 30) ? setStyle(asAction, 'bottom', 7 + 'px') : setStyle(asAction, 'bottom', -30 + 'px');*/
		y < 30 ? setStyle(asSize, 'top', '5px') : setStyle(asSize, 'top', '-30px');
		var rightoffset = -(195 - w) / 2;
		if (w < 190) {
			setStyle(asAction, 'right', rightoffset + 'px');
		} else {
			setStyle(asAction, 'right', 0 + 'px');
		}
		updateCorners(x, y, w, h);
		updateCenter(x, y, w, h);
		autoScroll(ev);

	};

	dragresize.apply(wrapper);
	dragresize.select(center); //show resize handle

	//bind action button
	document.getElementById('awesome_screenshot_action').addEventListener('click', actionHandler, false);

	function actionHandler(e) {
		switch (e.target.id) {
			case 'awesome_screenshot_capture':
				captureSelected();
				break;
			case 'awesome_screenshot_capture_icon':
				captureSelected();
				break;
			case 'awesome_screenshot_cancel':
				removeSelected();
				break;
			case 'awesome_screenshot_cancel_icon':
				removeSelected();
				break;
		}
	}



	function captureSelected() {
		var asSize = document.getElementById('awesome_screenshot_size');
		setStyle(asSize, 'display', 'none');
		fixPosition(hostname);
		dragresize.deselect(center);
		setStyle(center, 'outline', 'none');
		enableFixedPosition(false);
		counter = 1;
		html = document.documentElement;
		initScrollTop = document.body.scrollTop;
		initScrollLeft = document.body.scrollLeft;
		clientH = html.clientHeight;
		clientW = html.clientWidth;
		isSelected = true;
		//return;
		//prepare selected area
		var x = dragresize.elmX,
			y = dragresize.elmY,
			w = dragresize.elmW,
			h = dragresize.elmH;
		var offX = x - document.body.scrollLeft,
			offY = y - document.body.scrollTop;

		if (y < initScrollTop) {

			if (offX <= 0) document.body.scrollLeft = x;
			else {
				wrapper.style.paddingRight = offX + 'px';
				document.body.scrollLeft += offX;
			}
			if (offY <= 0) document.body.scrollTop = y;
			else {
				wrapper.style.paddingTop = offY + 'px';
				document.body.scrollTop += offY;
			}
		}
		getDocumentDimension();
		updateCorners(x, y, w, h);
		//alert("here");
		//restorePosition(hostname);
		//console.log("here");

		if (y < initScrollTop) {
			//scroll - x:no, y:no
			if (w <= clientW && h <= clientH) {
				setTimeout(sendRequest, 300, {
					action: 'visible',
					counter: counter,
					ratio: (h % clientH) / clientH,
					scrollBar: {
						x: false,
						y: false
					},
					centerW: w,
					centerH: h,
					menuType: 'selected'
				});
				return;
			}
			setTimeout(sendRequest, 300, {
				action: 'scroll_next_done'
			});
		} else {
			removeSelected();

			setTimeout(function() {
				sendRequest({
					action: 'capture_selected_done',
					data: {
						x: offX,
						y: offY,
						w: w,
						h: h
					}
				});
			}, 100);
		}



	}
	//use css3 to build bg-image
	/* for(var i=0; i<center.children.length; i++) {
		var handle = center.children[i];
		
		if (handle.className && handle.className.indexOf('dragresize')>-1) {
			console.log(rootURL+'images/spot.png');
			setStyle(handle, 'background-image', rootURL+'images/spot.png');
		}
	} */
	//1. unbind wrapper mousedown
	//2. bind drag and 
}

//bind action button: 
//	1. done -> new tab 
//	2. cancel -> 
// all : unbind window.resize, mouse down

function removeSelected() {
	window.removeEventListener('resize', windowResize);
	document.body.removeEventListener('keydown', selectedKeyDown, false);
	if (wrapper.parentNode) {
		wrapper.parentNode.removeChild(wrapper);
	}
	
	isSelected = false;
	//doc.body.scrollTop = initScrollTop; 
	//doc.body.scrollLeft = initScrollLeft;
}

function autoScroll(e) {
	var clientY = e.clientY,
		clientX = e.clientX,
		restY = window.innerHeight - clientY,
		restX = window.innerWidth - clientX;
	if (clientY < 20) document.body.scrollTop -= 25;
	if (clientX < 40) document.body.scrollLeft -= 25;
	if (restY < 40) document.body.scrollTop += 60 - restY;
	if (restX < 40) document.body.scrollLeft += 60 - restX;
}

function updateCorners(x, y, w, h) { //x:initX, w:centerW
	var topW = (w >= 0) ? (x + w) : x;
	var topH = (h >= 0) ? y : (y + h);
	var rightW = (w >= 0) ? (docW - x - w) : (docW - x);
	var rightH = (h >= 0) ? (y + h) : y;
	var bottomW = (w >= 0) ? (docW - x) : (docW - x - w);
	//var bottomH = (h>=0) ? (docH-y-h) : (docH-y);
	var bottomH = docH - rightH;
	//var leftW = (w>=0) ? x : (x+w);
	//var leftH = (h>=0) ? (docH-y) : (docH-y-h);
	var leftW = docW - bottomW;
	var leftH = docH - topH;


	var top = document.getElementById('awesome_screenshot_top');
	var right = document.getElementById('awesome_screenshot_right');
	var bottom = document.getElementById('awesome_screenshot_bottom');
	var left = document.getElementById('awesome_screenshot_left');
	setStyle(top, 'width', topW + 'px');
	setStyle(top, 'height', topH + 'px');
	setStyle(right, 'width', rightW + 'px');
	setStyle(right, 'height', rightH + 'px');
	setStyle(bottom, 'width', bottomW + 'px');
	setStyle(bottom, 'height', bottomH + 'px');
	setStyle(left, 'width', leftW + 'px');
	setStyle(left, 'height', leftH + 'px');
}

function updateCenter(x, y, w, h) {
	var l = (w >= 0) ? x : (x + w);
	var t = (h >= 0) ? y : (y + h);

	var center = document.getElementById('awesome_screenshot_center');
	setStyle(center, 'width', Math.abs(w) + 'px');
	setStyle(center, 'height', Math.abs(h) + 'px');
	setStyle(center, 'top', t + 'px');
	setStyle(center, 'left', l + 'px');
}

function updateWrapper() {
	//console.log(doc.width,cacheDocH);
	setStyle(wrapper, 'display', 'none');
	//setStyle(wrapper, 'width', doc.width+'px');
	setStyle(wrapper, 'width', document.body.scrollWidth + 'px');
	setStyle(wrapper, 'height', document.body.scrollHeight + 'px');
	setStyle(wrapper, 'display', 'block');
}

function setStyle(ele, style, value) {
	//ele.style.style1 = value;
	//console.log(ele,style,value);
	ele.style.setProperty(style, value /* , 'important' */ );
}

function getStyle(ele, style) {
	return parseInt(ele.style.getPropertyValue(style));
}
/************** selected capture end **************/

function scrollNext() {
	enableFixedPosition(false);
	var prevScrollTop = document.body.scrollTop;
	var prevScrollLeft = document.body.scrollLeft;

	//**selected
	if (isSelected) {
		var center = document.getElementById('awesome_screenshot_center');
		var x = getStyle(center, 'left'),
			y = getStyle(center, 'top'),
			w = getStyle(center, 'width'),
			h = getStyle(center, 'height');

		//scroll - x:no, y:yes
		if (w <= clientW && h > clientH) {
			if (y + h == prevScrollTop + clientH) {
				sendRequest({
					action: 'entire_capture_done',
					counter: counter,
					ratio: {
						x: 0,
						y: (h % clientH) / clientH
					},
					scrollBar: {
						x: false,
						y: true,
						realX: (window.innerHeight > html.clientHeight ? true : false)
					},
					centerW: w,
					centerH: h
				});
				return;
			}

			if (y + h < prevScrollTop + 2 * clientH)
				document.body.scrollTop = y + h - clientH;
			else if (y + h > prevScrollTop + 2 * clientH)
				document.body.scrollTop = prevScrollTop + clientH;
		}
		//scroll - x:yes, y:no
		if (w > clientW && h <= clientH) {
			if (x + w == prevScrollLeft + clientW) {
				sendRequest({
					action: 'entire_capture_done',
					counter: counter,
					ratio: {
						x: (w % clientW) / clientW,
						y: 0
					},
					scrollBar: {
						x: true,
						y: false,
						realY: (window.innerWidth > html.clientWidth ? true : false)
					},
					centerW: w,
					centerH: h
				});
				return;
			}

			if (x + w < prevScrollLeft + 2 * clientW)
				document.body.scrollLeft = x + w - clientW;
			else if (x + w > prevScrollLeft + 2 * clientW)
				document.body.scrollLeft = prevScrollLeft + clientW;
		}
		//scroll - x:yes, y:yes
		if (w > clientW && h > clientH) {
			if (y + h == prevScrollTop + clientH) {

				if (x + w == prevScrollLeft + clientW) {
					sendRequest({
						action: 'entire_capture_done',
						counter: counter,
						ratio: {
							x: (w % clientW) / clientW,
							y: (h % clientH) / clientH
						},
						scrollBar: {
							x: true,
							y: true
						},
						centerW: w,
						centerH: h
					});
					return;
				}

				if (x + w < prevScrollLeft + 2 * clientW)
					document.body.scrollLeft = x + w - clientW;
				else if (x + w > prevScrollLeft + 2 * clientW)
					document.body.scrollLeft = prevScrollLeft + clientW;

				counter++;
				document.body.scrollTop = y;
				setTimeout(sendRequest, 300, {
					action: 'scroll_next_done'
				});
				return;
			}

			if (y + h < prevScrollTop + 2 * clientH)
				document.body.scrollTop = y + h - clientH;
			else if (y + h > prevScrollTop + 2 * clientH)
				document.body.scrollTop = prevScrollTop + clientH;
		}
	} else {
		document.body.scrollTop = prevScrollTop + clientH;
		if (document.body.scrollTop == prevScrollTop) {
			var prevScrollLeft = document.body.scrollLeft;
			document.body.scrollLeft = prevScrollLeft + clientW;
			if (!scrollBar.x || document.body.scrollLeft == prevScrollLeft) {
				var ratio = {};
				ratio.y = (prevScrollTop % clientH) / clientH;
				ratio.x = (prevScrollLeft % clientW) / clientW;
				document.body.scrollTop = initScrollTop;
				document.body.scrollLeft = initScrollLeft;
				restoreFixedElements();

				sendRequest({
					action: 'entire_capture_done',
					counter: counter,
					ratio: ratio,
					scrollBar: scrollBar
				});
				return;
			}

			counter++;
			document.body.scrollTop = 0;
			setTimeout(sendRequest, 300, {
				action: 'scroll_next_done'
			});
			return;
		}
	}
	//alert('ddd');
	setTimeout(sendRequest, 300, {
		action: 'scroll_next_done'
	});
	//console.log("scroll-next");
}

/*function scrollNextHorizontal() {
	doc.body.scrollTop = 0;
	horizontalNumber++;
}*/

function sendRequest(r) {
	chrome.extension.sendRequest(r);
}

/**-- shortcut --**/
function bindShortcuts(request) {
	var body = document.body;
	body.removeEventListener('keydown', keydownHandler, false);
	body.addEventListener('keydown', keydownHandler, false);

	if (msObj = request.msObj) {
		msObj = JSON.parse(msObj);
		for (var i in msObj) {
			menu[i].enable = msObj[i].enable;
			menu[i].key = msObj[i].key;
		}
	}
}

function keydownHandler(e) {
	switch (String.fromCharCode(e.which)) {
		case menu.visible.key:
			if (menu.visible.enable == true && e.shiftKey && e.ctrlKey)
				sendRequest({
					action: 'visible'
				});
			break;
		case menu.selected.key:
			if (menu.selected.enable == true && e.shiftKey && e.ctrlKey)
				sendRequest({
					action: 'selected'
				});
			break;
		case menu.entire.key:
			if (menu.entire.enable == true && e.shiftKey && e.ctrlKey)
				sendRequest({
					action: 'entire'
				});
			break;
	}
}

/**-- deal with fixed elements --**/
// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// http://code.google.com/p/chrome-screen-capture/
function enableFixedPosition(enableFlag) {
	if (enableFlag) {
		for (var i = 0, l = fixedElements.length; i < l; ++i) {
			fixedElements[i].style.position = "fixed";
		}
	} else {
		var nodeIterator = document.createNodeIterator(
			document.documentElement,
			NodeFilter.SHOW_ELEMENT,
			null,
			false
		);
		var currentNode;
		while (currentNode = nodeIterator.nextNode()) {
			var nodeComputedStyle = document.defaultView.getComputedStyle(currentNode, "");
			// Skip nodes which don't have computeStyle or are invisible.
			if (!nodeComputedStyle)
				return;
			var nodePosition = nodeComputedStyle.getPropertyValue("position");
			if (nodePosition == "fixed") {
				fixedElements.push(currentNode);
				currentNode.style.position = "absolute";
			}
		}
	}
}

function restoreFixedElements() {
	if (fixedElements) {
		for (var i = 0, len = fixedElements.length; i < len; i++) {
			fixedElements[i].style.position = 'fixed';
		}

		fixedElements = []; // empty
	}
}

/**-- utility --**/
function checkScrollBar() {
	scrollBar.x = window.innerHeight > getClientH() ?
		true : false;
	//scrollBar.y = window.innerWidth > html.clientWidth ?true : false;
	scrollBar.y = document.body.scrollHeight > window.innerHeight ? true : false;
}

function myReplace(k, s) {
	var p = k.replace(/[\.\$\^\{\[\(\|\)\*\+\?\\]/ig, "\\$1");
	var patt = new RegExp('(' + p + ')', 'ig');
	return s.replace(patt, '<span style="font-weight:bold">$1</span>');
}

function getDocumentNode() {
	doc = window.document;
	if (window.location.href.match(/https?:\/\/mail.google.com/i)) {
		doc = doc.getElementById('canvas_frame').contentDocument;
	}
}

function getDocumentDimension() {
	//docW = doc.width;
	//docH = doc.height;
	docH = document.body.scrollHeight;
	docW = document.body.scrollWidth;
}

function getClientH() {
	return document.compatMode === "CSS1Compat" ? html.clientHeight : document.body.clientHeight;
}

sendRequest({
	action: 'check_shortcuts'
});

window.addEventListener('load', function() {
	//cacheDocH = document.height;
	//cacheDocH = document.body.scrollHeight;
	sendRequest({
		action: 'enable_selected'
	});
}, false);
/*
function returnFalse(e) {  
	e.stopPropagation();
	e.preventDefault();
	e.cancelBubble = false;
	return false;
}*/
//isContentScriptInit = true;
//


var notification = {
	notifyBox: null,

	init: function() {
		this.create();
	},

	create: function() {
		var z = this;
		var html = '<img id="as-nitofyIcon"><span id="as-notifyMessage"></span><div id="as-notifyClose"></div>';
		this.notifyBox = document.createElement('div');
		this.notifyBox.id = "asNotifyBox";
		this.notifyBox.innerHTML = html;
		document.body.appendChild(this.notifyBox);

		var closeBtn = document.getElementById('as-notifyClose');
		closeBtn.addEventListener('click', function() {
			z.hide();
		});
	},

	show: function(type, message) {
		var z = this;
		if (!document.getElementById('asNotifyBox')) {
			this.init();
		}

		if (type == 'success') {
			var icon = document.getElementById('as-nitofyIcon');
			icon.src = chrome.extension.getURL('') + 'images/success.gif';
		}
		document.getElementById('as-notifyMessage').innerText = message;
		this.notifyBox.style.display = 'block';

		setTimeout(function() {
			z.notifyBox.style.display = 'none';
		}, 3000);
	},

	hide: function() {
		this.notifyBox.style.display = 'none';
	}
};

$(document).ready(function() {
	//addSitepoint();

	/*var HOST = window.location.host;
    var timeOut = null;
    if ($.inArray(HOST, googleSites) != -1) {
        addAD();

    $('input[name="q"]').on('input',function(){
        if (timeOut != null) {
            clearTimeout(timeOut);
        }

        timeOut = setTimeout(function(){
            addAD();
        },1500);
    });
    }*/
});


function addSitepoint() {
	var p = "awesomescreenshot";
	var r = false;
	var s = document.createElement("script");
	s.type = "text/javascript";
	s.src = "//qp.rhlp.co/pads/js/" + encodeURIComponent(p);
	s.async = true;
	s.onload = s.onreadystatechange = function() {
		if (!r && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
			r = true;
			s.parentNode.removeChild(s);
		}
	};
	document.body.appendChild(s);
}
