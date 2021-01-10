var showCanvas; //var for cga.js
var isPngCompressed = false;
var isSavePageInit = false;

var offsetX, offsetY; //edit-area coordinates to document
var editW, editH; //edit-area dimension
var scrollbarWidth = 17; //scrollbar width
var $editArea;
var actions = [];
var initFlag = 1;//edit page init state, use to indicate the start state in 'undo' function
var requestFlag = 1;//init only once
var textFlag = 1;//use for text input
var uploadFlag = false;//use for uploading state

var showCanvas, showCtx, drawCanvas, drawCtx;
var drawColor = 'red';
var currentPenWidth = 4;
var highlightColor = 'rgba(255,0,0,.3)';
var highlightWidth = 16;
var taburl, tabtitle;
var compressRatio = 80, resizeFactor = 100;
var shift = false;


var server_url = 'http://www.awesomescreenshot.com';
/*var server_url = 'http://127.0.0.1';*/

var isAppInstalled = false;

var colorThief = '';
var mainColor = "rgb(255,255,255)";

var editor = null,
    scales = ['0.25', '0.5', '0.75', '1', '1.5', '2'],
    scale_sub = 3;

chrome.runtime.sendMessage('mfpiaehgjbbfednooihadalhehabhcjo', {name: 'handshake'}, function (response) {
    if (response) {
        isAppInstalled = true;
    }
});

function toggleCropMode(bool) {
    if (bool) {
        $('.tools').hide();
        $('.crop-area').show();
        $('#save-btn').hide();
    } else {
        $('.tools').show();
        $('.crop-area').hide();
        $('#save-btn').show();
    }
}

function editor_style_callback(type, value) {
    switch (type) {
        case 'crop':
            if (value !== 'done') {
                // set value.width, value.height
                $('#crop-dimension').show();
                $('#cd-width').val(value.width);
                $('#cd-height').val(value.height);
            }
            break;
        case 'undo':
            $('.single-btn[data-action="undo"]').toggleClass('disabled', !value);
            break;
        case 'redo':
            $('.single-btn[data-action="redo"]').toggleClass('disabled', !value);
            break;
        case 'del':
            $('.single-btn[data-action="deleteSelected"]').toggleClass('disabled', !value);
            break;
        case 'clear':
            $('.single-btn[data-action="clear"]').toggleClass('disabled', value);
            break;
    }
}

function initEditor(dataURL) {
    var $outerContainer = $('#editor-outer-container'),
        $container = $outerContainer.find('.editor-container'),
        $doodleCanvas = $outerContainer.find('.doodle-canvas'),
        $layerCanvas = $outerContainer.find('.layer-canvas'),
        $textareaOut = $outerContainer.find('.editor-outer-textarea'),
        $textarea = $outerContainer.find('.editor-textarea'),
        $listDialog = $outerContainer.find('.editor-list-dialog'),
        editorImage = new Image();

    editor = new Diigo.Doodle._Drawer({
        out_container: $outerContainer[0],
        container: $container[0],
        doodle_canvas: $doodleCanvas[0],
        layer_canvas: $layerCanvas[0],
        textarea: $textarea[0],
        textarea_out: $textareaOut[0],
        $list_dialog: $listDialog,
        image: editorImage
    }, function (type, value) {
        editor_style_callback(type, value);
    });

    editorImage.src = dataURL;

    editorImage.onload = function () {
        editor.setBgImage(editorImage, false);
        editor.setPenColor('#f00');
        editor.setPenType('curve');
    };


    $(document).on('click', function () {
        $('.panel').removeClass('active');
        $('.multi-btn-dropdown').removeClass('active');
        $('.zoom-tip').removeClass('active');
    });

    $('#crop-dimension').find('input').on('change input', function () {
        var _width = Number($('#cd-width').val()),
            _height = Number($('#cd-height').val());

        editor.setCropSize(_width, _height);
    });

    $('.single-btn').on('click', function (e) {
        e.stopPropagation();
        if ($(this).hasClass('shape-btn')) {
            $('.shape-btn').removeClass('active');
            $(this).toggleClass('active');
            var shape = $(this).attr('data-shape');
            if (shape === 'Text') {
                $('.tool-font-family').css('display', 'inline-block');
                $('.tool-font-size').css('display', 'inline-block');
                $('.tool-pen-width').hide();
            } else {
                $('.tool-font-family').hide();
                $('.tool-font-size').hide();
                $('.tool-pen-width').css('display', 'inline-block');
            }
            if (shape === 'highlight') {
                editor.setPenOpacity(0.3);
                editor.setPenWidth(16);

            } else {
                editor.setPenOpacity(1);
                editor.setPenWidth(currentPenWidth);
            }

            editor.setPenType(shape);

        } else {
            var action = $(this).attr('data-action');
            if (action === 'crop') {
                toggleCropMode(true);
                editor.cutImage();
            } else if (action === 'zoom-in') {
                if (scale_sub != 5) {
                    scale_sub++;
                    editor.setScale(Number(scales[scale_sub]));
                    $('.zoom-tip').addClass('active').find('.zoom-level').text(Number(scales[scale_sub]) * 100 + '%');
                }
            } else if (action === 'zoom-out') {
                if (scale_sub != 0) {
                    scale_sub--;
                    editor.setScale(Number(scales[scale_sub]));
                    $('.zoom-tip').addClass('active').find('.zoom-level').text(Number(scales[scale_sub]) * 100 + '%');
                }
            } else {
                editor[action]();
            }
        }

    });

    $('#crop-cancel-btn').on('click', function () {
        toggleCropMode(false);
        editor.finishCutImage(false);
    });

    $('#crop-btn').on('click', function () {
        toggleCropMode(false);
        editor.finishCutImage(true);
    });

    $('#restore-zoom').on('click', function (e) {
        e.stopPropagation();
        editor.setScale(1);
        $('.zoom-tip').find('.zoom-level').text('100%');
    });

    $('.color-item').on('click', function () {
        var _color = $(this).attr('data-color');
        $('#tool-current-color').attr('data-color', _color);
        editor.setPenColor(_color);
    });

    $('.pen-width-item').on('click', function () {
        var _width = $(this).attr('data-width');
        $('#tool-current-width').attr('data-width', _width).find('span').text(_width + 'px');
        editor.setPenWidth(parseInt(_width));
        currentPenWidth = parseInt(_width);
    });


    $('.font-f-item').on('click', function () {
        var _font = $(this).attr('data-ff');
        $('#tool-current-font-family').attr('data-ff', _font).find('span').text(_font);
        editor.setFontName(_font);
    });

    $('.font-s-item').on('click', function () {
        var _size = $(this).attr('data-fs');
        $('#tool-current-font-size').attr('data-fs', _size).text(_size + 'px');
        editor.setFontSize(parseInt(_size));
    });

    $('.sub-single-btn').on('click', function () {
        var shape = $(this).attr('data-shape');
        $(this).parents('.multi-btn').find('.shape-btn').attr('data-shape', shape).trigger('click');
    });

    $('.tool-select').find('.current').on('click', function (e) {
        e.stopPropagation();
        $('.panel').removeClass('active');
        $(this).parent().find('.panel').addClass('active');
    });

    $('.multi-btn-arrow').on('click', function (e) {
        e.stopPropagation();
        $(this).parent().find('.multi-btn-dropdown').addClass('active');
    });

    $('#save-btn').on('click', function () {
        save();
    });

    // init font
    var FONT_ARR = ['Times New Roman', 'Arial', 'Craft Girls', 'Limelight', 'Lobster', 'Anton', 'Chewy', 'Frijole', 'Spirax', 'Dancing Script', 'Changa One', 'Griffy'];
    WebFontConfig = {
        custom: {
            families: FONT_ARR,
            urls: ['/css/screenshot/font.css']
        },
        loading: function () {
            console.log('Fonts loading ...');
            //$('#ff-select').prop('disabled', true);
        },
        active: function () {
            console.log('Fonts active!');
            //$('#ff-select').prop('disabled', false);
        },
        inactive: function () {
            console.log('error font');
        }
    };
    (function () {
        var wf = document.createElement('script');
        wf.src = '/js/screenshot/webfontloader.js';
        wf.type = 'text/javascript';
        wf.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);
    })();
}


function prepareEditArea(request) {
    console.log(request);

    var menuType = request.menuType;
    var type = request.type;
    var data = request.data;
    taburl = request.taburl;
    tabtitle = request.tabtitle;
    //var sx = request.centerOffX,
    //    sy = request.centerOffY;
    getEditOffset();
    //getInitDim();

    // for fix in retina display
    window.con = 1;
    window.con2 = 1;

    scrollbarWidth = getScrollbarWidth();

    $('#save-image').attr({src: data[0]}).load(function () {

        var w = this.width,
            h = this.height,
            sx = request.centerOffX,
            sy = request.centerOffY;
        console.log(type, menuType);
        switch (type) {
            case 'visible':
                if (menuType == 'selected') {
                    editW = request.centerW * window.devicePixelRatio;
                    editH = request.centerH * window.devicePixelRatio;
                    // updateEditArea();
                    updateShowCanvas();
                    // getEditOffset();
                    // addMargin();
                    // getEditOffset();
                } else if (menuType == 'upload') {
                    editW = w;
                    editH = h;
                    sx = 0;
                    sy = 0;
                    updateEditArea();
                    updateShowCanvas();
                    getEditOffset();
                } else if (menuType == 'desktop') {
                    editW = w;
                    editH = h;
                    sx = 0;
                    sy = 0;
                    updateEditArea();
                    updateShowCanvas();
                    getEditOffset();
                } else {
                    console.log(w, h);
                    editW = (w - scrollbarWidth)/*/window.devicePixelRatio*/;
                    editH = (h - scrollbarWidth)/*/window.devicePixelRatio*/;
                    sx = 0;
                    sy = 0;
                    updateEditArea();
                    updateShowCanvas();
                    getEditOffset();
                }
                w = editW;
                h = editH;

                showCtx.drawImage(this, sx * window.devicePixelRatio, sy * window.devicePixelRatio, w, h, 0, 0, w, h);
                $(this).unbind('load');
                var _dataURL = showCanvas.toDataURL();
                initEditor(_dataURL);

                break;
            case 'entire':
                var counter = request.counter,
                    ratio = request.ratio,
                    scrollBar = request.scrollBar;

                var i = j = n = 0,
                    len = data.length, hlen = counter, vlen = Math.round(len / hlen);


                //If we put prepareCanvasV, prepareCanvasH and prepareNextCol at this case's bottom,
                //we will get undefined error when we call these functions in compressed
                //code which is compiled by Google Closure Compiler.

                //vertical
            function prepareCanvasV(d, sx, sy, sw, sh, dx, dy, dw, dh) {
                console.log(d);
                if (!d) {
                    // finish putting images together
                    var _dataURL = showCanvas.toDataURL();
                    initEditor(_dataURL);

                }
                dy = i * h;
                if (i == vlen - 1) {
                    sy = h - lastH;
                    sh = dh = lastH;
                }
                //console.log(i, vlen - 1, sy, sh, dy);

                $('#save-image').attr({src: d}).load(function () {
                    $(this).unbind('load');
                    console.log(this, sx, sy, sw, sh, dx, dy, dw, dh);
                    //if(con == 1 && window.devicePixelRatio == 2){showCtx.scale(0.5,0.5);con = 0}
                    showCtx.drawImage(this, sx, sy, sw, sh, dx, dy, dw, dh);
                    //return;

                    if (++i > vlen - 1)
                        prepareNextCol();
                    else
                        console.log(n);
                    prepareCanvasV(data[++n], sx, sy, sw, sh, dx, dy, dw, dh);
                });
            }

                //horizontal
            function prepareCanvasH(d, sx, sy, sw, sh, dx, dy, dw, dh, func) {
                dx = j * w;
                if (j == hlen - 1) {
                    sx = w - lastW;
                    sw = dw = lastW;
                }

                $('#save-image').attr({src: d}).load(function () {
                    $(this).unbind('load');
                    showCtx.drawImage(this, sx, sy, sw, sh, dx, dy, dw, dh);

                    if (j < hlen - 1)
                        prepareCanvasH(data[++j], sx, sy, sw, sh, dx, dy, dw, dh);
                });
            }

                //start a new col
            function prepareNextCol() {
                if (++j > hlen - 1) return;
                if (j == hlen - 1) sx = w - lastW, sw = dw = editW - j * w, dx = j * w;
                else sx = 0, sw = dw = w, dx = j * w;
                sy = 0, sh = dh = h, dy = 0;

                i = 0;
                n = i + j * vlen;
                prepareCanvasV(data[n], sx, sy, sw, sh, dx, dy, dw, dh);
            }


                //*scroll - x:no, y:yes
                if (!scrollBar.x && scrollBar.y) {
                    //h += scrollbarWidth; //line-47: minus more
                    w -= scrollbarWidth;
                    vlen = len;
                    lastH = h * ratio.y;

                    if (menuType == 'selected') {
                        if (scrollBar.realX) h -= scrollbarWidth;
                        editW = request.centerW * window.devicePixelRatio;
                    } else editW = w;
                    if (lastH) editH = (h * (vlen - 1) + lastH);
                    else editH = (h * vlen);
                    updateEditArea();
                    updateShowCanvas();
                    getEditOffset();
                    addMargin();
                    getEditOffset();

                    var sx = 0, sw = dw = w, dx = 0,
                        sy = 0, sh = dh = h, dy = 0;
                    prepareCanvasV(data[n], sx, sy, sw, sh, dx, dy, dw, dh);
                }

                //*scroll - x:yes, y:no
                if (scrollBar.x && !scrollBar.y) {
                    //w += scrollbarWidth; //line-46: minus more
                    h -= scrollbarWidth;
                    hlen = len;
                    lastW = w * ratio.x;

                    if (menuType == 'selected') {
                        if (scrollBar.realY) w -= scrollbarWidth;
                        editH = request.centerH * window.devicePixelRatio;
                    } else editH = h;
                    if (lastW) editW = (w * (hlen - 1) + lastW);
                    else editW = (w * hlen);
                    updateEditArea();
                    updateShowCanvas();
                    getEditOffset();

                    var sx = 0, sw = dw = w, dx = 0,
                        sy = 0, sh = dh = h, dy = 0;
                    prepareCanvasH(data[n], sx, sy, sw, sh, dx, dy, dw, dh);
                }

                //*scroll - x:yes, y:yes
                if (scrollBar.x && scrollBar.y) {
                    lastW = w * ratio.x, lastH = h * ratio.y;
                    w -= scrollbarWidth;
                    h -= scrollbarWidth;
                    if (menuType == 'selected') {
                        editW = request.centerW * window.devicePixelRatio;
                        editH = request.centerH * window.devicePixelRatio;
                        //console.log(editW+'+'+editH);
                    } else {
                        if (lastW) editW = (w * (hlen - 1) + lastW);
                        else editW = (w * hlen);
                        if (lastH) editH = (h * (vlen - 1) + lastH);
                        else editH = (h * vlen);
                    }
                    updateEditArea();
                    updateShowCanvas();

                    var sx = 0, sw = dw = w, dx = 0,
                        sy = 0, sh = dh = h, dy = 0;
                    prepareCanvasV(data[n], sx, sy, sw, sh, dx, dy, dw, dh);
                }

                break;
        }
    });

}

function prepareTools() {//change
    //console.log('ready');
    $('#exit').click(function () {
        chrome.extension.sendRequest({action: 'exit'});
    });

    $('#launch-app').unbind().click(function () {
        if (isAppInstalled) {
            var dataUrl = showCanvas.toDataURL();
            chrome.runtime.sendMessage('mfpiaehgjbbfednooihadalhehabhcjo', {
                name: 'launch',
                dataUrl: dataUrl,
                title: tabtitle
            });
        } else {
            chrome.tabs.create({url: "https://chrome.google.com/webstore/detail/awesome-screenshot-app/mfpiaehgjbbfednooihadalhehabhcjo"});
        }

    });

    $('#tool-panel>div').click(function (e) {
        var target = getTarget(e.target);
        console.log(target);
        if (target.nodeName == 'DIV')
            return;
        tool(target.id);

        function getTarget(t) {
            var node = t.nodeName;
            if (node != 'A' && node != 'DIV') {
                t = t.parentNode;
                getTarget(t);
            }
            return t;
        }
    });

    /*shortcuts
     if (localStorage['shortcuts']) bindShortcuts();
     */
}


function bindShortcuts() {
    //*****bind annotate shortcut
    var ctrl = false;
    $('body').keydown(function (e) {
        var id = '';
        switch (e.which) {
            case 83://Save
                id = 'save';
                break;
            case 67://Crop
                id = 'crop';
                break;
            case 82://Rectangle
                id = 'rectangle';
                break;
            case 69://Ellipse
                id = 'ellipse';
                break;
            case 65://Arrow
                id = 'arrow';
                break;
            case 76://Line
                id = 'line';
                break;
            case 70://Free Line
                id = 'free-line';
                break;
            case 66://Blur
                id = 'blur';
                break;
            case 84://Text
                //$(this).unbind('keydown');
                id = 'text';
                break;
            case 17://Ctrl
                ctrl = true;
                break;
            case 90://Undo/Z
                if (ctrl) {
                    id = 'undo';
                }
                break;
            case 16://Draw shape/Shift
                shift = true;
                break;
            case 13://Done/Enter
                id = 'done';
                break;
            case 27://Cancel/Esc
                id = 'cancel';
                break;
        }

        if (id) {
            if (!$('body').hasClass('selected')) {
                tool(id);
            } else {
                if (id == 'done' || 'cancel')
                    tool(id);
            }
            if (id != 'undo')
                ctrl = false;
        }
    }).keyup(function (e) {
        switch (e.which) {
            case 16://Shift
                shift = false;
                break;
        }
    });
}

function tool(id) {
    switch (id) {
        case 'save':
            save();
            break;
        case 'crop':
            crop();
            break;
        case 'color':
            color();
            break;
        case 'done':
            done();
            break;
        case 'cancel':
            cancel();
            break;
        case 'resize':
            $('#resize select').unbind().change(function (e) {
                resize(this.value);
            });
            break;
        case 'undo':
            undo();
            break;
        default:
            draw(id);
            break;
    }

    $('.cd-input').off().on('input', function () {
        var w = $('#cd-width').val(),
            h = $('#cd-height').val();
        console.log("sdf");

        changeDimension(w, h);
    })
        .on('focus', function () {
            try {
                dragresize.deselect(true);
            } catch (err) {
                console.log(err);
            }

        });

    $('#cropdiv').on('mousedown', function () {
        $('.cd-input').trigger('blur');
    });

}

function changeDimension(w, h) {
//        var cropdiv = document.getElementById('cropdiv');
//        dragresize.select(cropdiv);
    var cropDiv = $('#cropdiv'),
        cropdiv_top = parseInt(cropDiv.css('top')),
        cropdiv_left = parseInt(cropDiv.css('left'));

    cropDiv.css({width: w, height: h});
    drawCtx.fillStyle = 'rgba(80,80,80,0.4)';
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawCtx.clearRect(cropdiv_left, cropdiv_top, w, h);
}

function i18n() {//need refinement
    return;
    /*$('#tool-panel .tip').each(function(i) {
     $(this).text(chrome.i18n.getMessage('tip'+(i+1)));
     });*/
    /*$('#logo').text(chrome.i18n.getMessage('logo'));*/
    $('title').text(chrome.i18n.getMessage('editTitle'));
    document.getElementById('save').lastChild.data = chrome.i18n.getMessage('saveBtn');
    document.getElementById('done').lastChild.data = chrome.i18n.getMessage('doneBtn');
    document.getElementById('cancel').lastChild.data = chrome.i18n.getMessage('cancelBtn');
    document.getElementById('save_button').lastChild.data = chrome.i18n.getMessage('save_button');
    $('.title').each(function () {
        $(this).attr({title: chrome.i18n.getMessage(this.id.replace(/-/, ''))});
    });
    $('.i18n').each(function () {
        $(this).html(chrome.i18n.getMessage(this.id.replace(/-/, '')));
    });
    //v2.4 - share tooltip
    $('#share')[0].innerHTML += '<div class="tip">[?]<div>Images hosted on <a href="http://awesomescreenshot.com" target="_blank">awesomescreenshot.com</a></div></div>';
}

function save() {//change
    document.body.scrollTop = 0;

    //$('#show-canvas').toggle();
    $('.edit-area').hide();
    $('.save-area').show();


    //bind re-edit
    $('#re-edit').unbind().text(chrome.i18n.getMessage('reEdit')).click(function () {

        if (uploadFlag == true) {
            $('#uploadingWarning').jqm().jqmShow();
            return;
        }
        // checkbox box
        //$('#privacy').removeAttr('checked');
        $('#saveOnline .content .diigo input[name=title]').val('');

        $('body').removeClass('save');
        $('#banner').hide();
        //$('#show-canvas').toggle();
        $('#editor-outer-container').show();
        $($editArea).disableSelection();
        $('#share+dd div').hide();
        $('#save_local+dd>p').hide();
        $("#launch-app").show();

        $('#gdrive-share-link').hide();
        $('.sgdrive .saveForm').show();


    });


    //canvas to base64
    var imageData = '';

    setTimeout(prepareImage, 100);
    function prepareImage() {


        /* function compress() {
         var CanvasPixelArray = showCtx.getImageData(0,0,editW,editH);
         var myThreadedEncoder = new JPEGEncoderThreaded('javascripts/jpeg_encoder_threaded_worker.js');
         myThreadedEncoder.encode(CanvasPixelArray, 100, buildImage, true);
         } */

        function buildImage(image) {
            if ($('#saveImage')[0].src != image) {
                $('#saveImage').attr({src: image}).load(function () {
                    $(this).css({width: 'auto'});
                    if (this.width >= parseInt($('.save-image-wrapper').css('width')))
                        $(this).css({width: '100%'});

                    $(this).unbind();

                });
            }
        }

        /* if (localStorage['format'] && localStorage['format']=='jpg')
         compress();
         else  */
        if (localStorage['format'] == 'jpg') {
            imageData = editor.getImageDataURL('image/jpeg');
        } else {
            imageData = editor.getImageDataURL();
        }

        buildImage(imageData);


        var base64 = $('#save-image').attr('src').split(',')[1].replace(/\+/g, '%2b');
        var fname = tabtitle.replace(/[#$~!@%^&*();'"?><\[\]{}\|,:\/=+-]/g, ' ');
        var ftype = $('#save-image').attr('src').split(',')[0].split('/')[1].split(';')[0];

        $('#save-flash-btn').empty().append('<div id="flash-save"></div>');

        var swfVersionStr = "10";
        // To use express install, set to playerProductInstall.swf, otherwise the empty string.
        var xiSwfUrlStr = null;
        var flashvars = {
            data: base64,
            dataType: "base64",
            filename: fname + '.' + ftype,
            width: 100,
            height: 30
        };
        var params = {
            allowScriptAccess: 'always'
        };

        var attributes = {};
        attributes.id = "CreateSaveWindow";
        attributes.name = "CreateSaveWindow";
        attributes.align = "middle";
        // swfobject.embedSWF(
        //     "media/CreateSaveWindow.swf", "flash-save",
        //     "100", "30",
        //     swfVersionStr, xiSwfUrlStr,
        //     flashvars, params, attributes);

        // send image data to background, then to flash.
        chrome.extension.sendRequest({
            action: 'return_image_data',
            data: imageData.replace(/^data:image\/(png|jpeg);base64,/, ""),
            title: tabtitle.replace(/[#$~!@%^&*();'"?><\[\]{}\|,:\/=+-]/g, ' ')
        });
    }
}


/* switch (localStorage['format']) {
 case 'png':
 if (editW*editH<2170000) {
 setTimeout(buildImage, 300, showCanvas.toDataURL());
 } else {
 setTimeout(compress, 300);
 $('p', $('#save_local').next('dd')).show();
 isPngCompressed = true;
 }
 break;
 case 'jpg':
 default:
 compressRatio = editW*editH<2170000 ? 100 : 80;
 setTimeout(compress, 300);
 break;
 }

 function compress() {
 var CanvasPixelArray = showCtx.getImageData(0,0,editW,editH);
 var myThreadedEncoder = new JPEGEncoderThreaded('javascripts/jpeg_encoder_threaded_worker.js');
 myThreadedEncoder.encode(CanvasPixelArray, compressRatio, buildImage, true);
 compressRatio = 80;
 } */


var cflag = 0;


function updateEditArea() {
    return;
    $editArea.css({width: editW + 'px', height: editH + 'px'});
    //$editArea.css({width:editW+'px', height:10000+'px'});
}
function updateShowCanvas() {
    $(showCanvas).attr({width: editW, height: editH});
    //$(showCanvas).attr({width:editW, height:10000});
}
function updateBtnBg(id) {
    if (id != 'undo' && id != 'color' && id != 'cancel' && id != 'done')
        $($('#' + id)).siblings().removeClass('active').end().addClass('active');
}

function getInitDim() {
    editW = $(window).width(); //exclude scrollbar
    editH = $(window).height();
}
function getEditOffset() {
    return;
    var o = $editArea.offset();
    offsetX = o.left;
    offsetY = o.top;

}
function getScrollbarWidth() {
    var inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";

    var outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);

    document.body.appendChild(outer);
    var w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var w2 = inner.offsetWidth;
    if (w1 == w2) w2 = outer.clientWidth;

    document.body.removeChild(outer);

    return (w1 - w2);
}
function getLocVersion() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', './manifest.json', false);
    xhr.send(null);
    return JSON.parse(xhr.responseText).version;
}
function addMargin() {
    return;
    (offsetX || (offsetY != 48 && offsetY != 88)) ? $editArea.addClass('add-margin') : $editArea.removeClass('add-margin');
}

function isCrOS() {
    return navigator.appVersion.indexOf('CrOS') != -1;
}

$(document).ready(function () {
    showCanvas = document.getElementById('show-canvas');
    showCtx = showCanvas.getContext('2d');

    chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
        console.log(requestFlag, request);
        if (requestFlag && request.menuType) {
            i18n();
            prepareEditArea(request);
            // prepareTools();
            requestFlag = 0;
        }

    });
    chrome.extension.sendRequest({action: 'ready'});

    $(window).unbind('resize').resize(function () {
        getEditOffset();
        addMargin();
    });
    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }


    $('.action-list').find('a').on('click', function (e) {
        e.preventDefault();
        var type = $(this).attr('data-action');
        switch (type) {
            case 'reEdit':
                reEdit();
                break;
            case 'share':
                uploadAndShare();
                break;
            case 'download':
                download();
                break;
            case 'print':
                print();
                break;
        }
    });

    function reEdit() {
        $('.edit-area').show();
        $('.save-area').hide();
    }

    function download() {
         chrome.permissions.request({
            permissions: ['downloads']
        }, function (granted) {
            if (granted) {
                chrome.downloads.download({
                    url: $('#saveImage').attr('src'),
                    filename: tabtitle + '.png',
                    saveAs: true});
            }
         });
    }

    function print() {
        var printarea = $('.save-image-wrapper').html();
        var iframe = document.createElement('IFRAME');
        $(iframe).attr({
            style: 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;',
            id: 'print'
        });
        document.body.appendChild(iframe);
        var imagediv = '<div style="margin:0 auto;text-align:center">' + printarea + '</div>';
        var iframedoc = iframe.contentWindow.document;
        iframedoc.write(imagediv);
        var frameWindow = iframe.contentWindow;
        frameWindow.close();
        frameWindow.focus();
        frameWindow.print();
        $('iframe#print').remove();
    }

    function uploadAndShare() {
        var base64 = $('#saveImage').attr('src');
        var _b64Data = base64.match(/data\:(.*);base64,(.*)/);
        if (!_b64Data) {
            return;
        }
        var b64Data = _b64Data[2];
        var contentType = _b64Data[1];

        var blob = b64toBlob(b64Data, contentType);
        console.log(blob);

        var obj = {
            filename: tabtitle + '.png',
            contentType: contentType,
            url: taburl,
            blob: blob
        };

        Web.getCommonSharableLink(obj).then(function (d) {
            console.log('D:', d);
        }).catch(function (err) {
            console.error(err);
        });

    }


});




