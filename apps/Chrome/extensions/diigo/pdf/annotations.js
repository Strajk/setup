var permissions = Bg.GlobalData.permissions;

/*
 * Diigo inc.
 * PDF reader and annotations
 *
 * The main file deal with diigo data and annotation action.
 *
 * Jiangbin
 * April 2014
 *
 * */

function diigoData(url, title, file_md5, data) {
    this.file_md5 = file_md5;
    this.file_title = title;
    this.file_content = data;
    this.file_size = data.length;
    this.user = diigoUtils.getUsername() || null;
    this.bookmark = {
        annotated: false,
        groups: [],
        saved: false,
        saving: false,
        uploaded: false,
        mode: 2,
        description: '',
        lists: [],
        outliners: [],
        tags: [],
        title: title,
        link_id: window.DIIGO_LINK_ID || null,
        url: url,
        server_url: '',
        shared_url: null,
        server_urlId: null
    };

    this.env = {
        myTags: [],
        myGroups: [],
        permissions: {premium: false, image: true, capture: true, snapshot: true, pdf: false},
        myProfile: {},
        myBookmarkLists: []
    };


    this.highlights = [];
    this.floatnotes = [];

    this.currentColor = 'yellow';

    this.isLocalFile = url && !url.match(/^(http|https|ftp|ftps):\/\//);
    this.loaded = false;
    var that = this;

    if (this.user) {
        $('#diigoTools button').attr('disabled', false);
    }

    diigoNetwork.bm_loadBookmark(this, "annotations bookmarkInfo", function (res) {
        console.log("load Bookmark", res);
        that.loaded = true;
        PDFView.setTitle(that.bookmark.title);
        // if(that.bookmark.mode!=2){
        //     $('body').addClass('shared');
        // }
        if (that.bookmark.saved) {
            // if(that.bookmark.mode!=2){
            //     $('body').addClass('shared');
            // }
            $('#bTxtTitle').val(that.bookmark.title);
            $('#bm-title').val(that.bookmark.title);
            $('#bTxtDesc').val(that.bookmark.description);
            $('#bm-desc').val(that.bookmark.description);
            that.bookmark.lists = res.bookmarkInfo.lists;
            that.bookmark.outliners = res.bookmarkInfo.outliners;
            that.bookmark.groups = res.groups;

            // update buttons
            $('#save').hide();
            $('#edit, #download, #share').show();
            var tag_str = '';
            $.each(that.bookmark.tags, function (i, v) {
                if (v.indexOf(' ') != -1) {
                    tag_str += '"' + v + '"';
                } else {
                    tag_str += v;
                }
                tag_str += " ";
            });
            $('#bTxtTags').val(tag_str);
            $('#bm-tags').val(tag_str);
            $('#save').addClass('saved');
            if (that.bookmark.uploaded) {
                $('#download_ann').attr('disabled', false);
            }
            diigoAnnotationHelper.setupLinks();
            PDFView.pdfRenderingQueue.setupDiigoAnnotationsOnRendered();
        } else {
            $('#bTxtTitle').val(document.title);
            $('#bm-title').val(that.bookmark.title);
        }
    });

    if (window.DIIGO_SHARE_KEY) {
        $('body').addClass('shared');
        return;
    }
    diigoNetwork.loadMyStuff("myTags  myBookmarkLists myGroups", this, function (data) {

        // update lists
        console.log(data);

        updateLists(data)
        if (data.myGroups) {
            updateGroups(data.myGroups)
        }


        // update groups


        console.log('Load user stuff successfully.');
        $.each(that.env.myBookmarkLists, function (index, list) {
            list.title = list.title.replace(/</, '&lt;').replace(/>/, '&gt;');
            $("#addToListSelector-pdf").append('<option value="' + list.id + '">' + list.title + '</option>');
        });

        $.each(that.bookmark.lists, function (index, list) {
            var id = list.id;
            var option = $("#addToListSelector-pdf option[value='" + id + "']");

            option.html(option.html() + ' (Added)');
        });

    });


}

var DiigoData = {};


function copyText(txt) {
    var textarea = document.createElement('div');
    textarea.innerHTML = txt;
    textarea.setAttribute('contenteditable', 'true');
    textarea.style.position = 'absolute';
    document.body.appendChild(textarea);
    textarea.focus();
    var selection = window.getSelection();
    range = document.createRange();
    range.selectNodeContents(textarea);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    document.body.removeChild(textarea);

}


var diigoAnnotationHelper = (function diigoAnnotationHelper() {

    var diigoAnnotationHelper = {};


    diigoAnnotationHelper.parseRange = function parseRange(pageIndex, rg) {
        var parentRc = PDFViewerApplication.pdfViewer._pages[pageIndex].canvas.getBoundingClientRect();
        var offsetX = parentRc.left, offsetY = parentRc.top;

        var p = document.createElement('div');
        p.appendChild(rg.cloneContents());
        var d_list = [];
        $(p).children().each(function () {
            if (this.tagName == 'DIV') {
                if ($(this).find('span').length > 0) {
                    $(this).find('span').each(function () {
                        d_list.push(this)
                    });
                } else {
                    d_list.push(this);
                }
            } else {
                d_list.push(this);
            }
        });

        var newList = [];
        var rects = rg.getClientRects();

        if (d_list.length == 0) {
            return {
                rects: [[rects[0].left - offsetX, rects[0].top - offsetY, rects[0].left - offsetX + rects[0].width, rects[0].top - offsetY + rects[0].height]],
                text: p.innerText
            };
        }

        for (var i = 0; i < d_list.length; i++) {
            var div = d_list[i];
            var left = parseFloat(div.getAttribute('data-left'));
            var width = parseFloat(div.getAttribute('data-width')) * parseFloat(div.getAttribute('data-transform-scale-x'));

            var top = parseFloat(div.getAttribute('data-top'));
            var height = parseFloat(div.getAttribute('data-fontSize')) * 1.3; //line-height:1.3

            var rect = [left, top, left + width, top + height];
            newList.push({rect: rect, text: div.innerHTML})
        }


        var res = {rects: [], text: ""};

        for (i = 0; i < newList.length; i++) {
            if (i > 0) {
                if (newList[i - 1].rect[1] != newList[i].rect[1]) {
                    if (res.text.length > 0) {
                        if (res.text.slice(-1) == "-") {
                            res.text = res.text.slice(0, -1)
                        } else {
                            if (res.text.slice(-1) != " ") {
                                res.text += " ";
                            }
                        }
                    }
                    res.rects.push(newList[i].rect);
                } else {
                    var prevRect = res.rects[res.rects.length - 1];
                    if (Math.abs(newList[i].rect[0] - prevRect[2]) < 20) {
                        prevRect[2] = newList[i].rect[2]
                    } else {
                        res.rects.push(newList[i].rect);
                    }
                }
            } else {
                res.rects.push(newList[i].rect);
            }
            res.text += newList[i].text;
        }
        return res;
    };


    diigoAnnotationHelper.removeHighlight = function removeHighlight(h_id) {
        var pageIndex;
        DiigoData.highlights = $.grep(DiigoData.highlights, function (ele, index) {
            if (ele.id == h_id) {
                pageIndex = ele.extra.pageIndex;
            }
            return ele.id != h_id;
        });
        if (pageIndex == undefined) {
            return false;
        }
        diigoNetwork.deleteHighlightAndStickyNote(h_id, DiigoData, function (resp, ct, code) {
            console.log('Delete Highlight Success. Server code: ' + code)
        });
        var page = PDFViewerApplication.pdfViewer._pages[pageIndex];
        page.drawDiigoHighlights();
    };

    diigoAnnotationHelper.removeFloatnote = function removeFloatnote(f_id) {
        var pageIndex;
        DiigoData.floatnotes = $.grep(DiigoData.floatnotes, function (ele, index) {
            if (ele.id == f_id) {
                pageIndex = ele.extra.pageIndex;
            }
            return ele.id != f_id;
        });

        if (pageIndex == undefined) {
            return false;
        }

        diigoNetwork.deleteHighlightAndStickyNote(f_id, DiigoData, function (resp, ct, code) {
            console.log('Delete floatnote successfully. Server code: ' + code);
        });

        var page = PDFViewerApplication.pdfViewer._pages[pageIndex];
        page.drawDiigoFloatnotes();

    };

    diigoAnnotationHelper.updateFloatnoteContent = function updateFloatnoteContent(f_id, content) {
        var pageIndex, ic_id;
        $.each(DiigoData.floatnotes, function (index, ele) {
            if (ele.id == f_id) {
                ele.comments[0].content = content;
                ic_id = ele.comments[0].id;
                pageIndex = ele.extra.pageIndex;
                return false;
            }
        });

        diigoNetwork.updateComment(ic_id, content, DiigoData, function (resp, ct, code) {
            console.log('Update floatnote comment successfully. Server code: ' + code);
        });

        var page = PDFViewerApplication.pdfViewer._pages[pageIndex];
        page.drawDiigoFloatnotes();

    };

    diigoAnnotationHelper.updateFloatnotePos = function updateFloatnotePos(f_id, pos) {
        var ann, page;
        $.each(DiigoData.floatnotes, function (index, ele) {
            if (ele.id == f_id) {
                page = PDFViewerApplication.pdfViewer._pages[ele.extra.pageIndex];
                var pdf_pos = page.getPagePoint(pos.left, pos.top);
                ele.extra.left = pdf_pos[0];
                ele.extra.top = pdf_pos[1];
                ann = ele;
                return false;
            }
        });

        diigoNetwork.updateHighlightAndStickyNote(ann, DiigoData, function (resp, ct, code) {
            console.log('Update floatnote position successfully. Server code: ' + code);
        });

        page.drawDiigoFloatnotes();
    };

    diigoAnnotationHelper.updateFloatnoteColor = function updateFloatnoteColor(f_id, color) {
        var pageIndex;
        var ann;
        $.each(DiigoData.floatnotes, function (index, ele) {
            if (ele.id == f_id) {
                if (ele.extra.color == color) {
                    return false;
                }
                ele.extra.color = color;
                ann = ele;
                pageIndex = ann.extra.pageIndex;
                return false;
            }
        });
        if (pageIndex == undefined) {
            return false;
        }
        var page = PDFViewerApplication.pdfViewer._pages[pageIndex];
        diigoNetwork.updateHighlightAndStickyNote(ann, DiigoData, function (resp, ct, code) {
            console.log('Update floatnote color successfully. Server code: ' + code);
        });
        page.drawDiigoFloatnotes();
    };

    diigoAnnotationHelper.appendHighlight = function appendHighlight(pageIndex, range, callback) {
        var res = this.parseRange(pageIndex, range);
        var quadRects = res.rects;
        var text = res.text;
        if ($.trim(text.replace(/<.+?>/g, '')) == "") {
            return false;
        }
        var diigoHighlight = {};
        diigoHighlight.id = diigoUtils.md5('' + DiigoData.bookmark.server_url + pageIndex + text + quadRects + Date.now());
        diigoHighlight.mode = 2;  //0:public 2:private
        diigoHighlight.type = 9;//TEXT: 0, IMAGE: 1, FLOATNOTE: 2, FLASH: 3, VIDEO: 4, PDF_HIGH: 5
        diigoHighlight.content = text;
        diigoHighlight.extra = {};
        diigoHighlight.extra.pageIndex = pageIndex;
        diigoHighlight.extra.quadRects = [];
        diigoHighlight.saved = false;
        diigoHighlight.extra.color = DiigoData.currentColor;
        var rect_left = quadRects[0][0], rect_top = quadRects[0][1], rect_right = quadRects[0][2], rect_bottom = quadRects[0][3];

        var page = PDFViewerApplication.pdfViewer._pages[pageIndex];
        for (var i = 0; i < quadRects.length; i++) {
            var rc = quadRects[i];
            var pdf_rect = page.getPagePoint(rc[0], rc[1]).concat(page.getPagePoint(rc[2], rc[3]));
            diigoHighlight.extra.quadRects.push(pdf_rect);
            rect_left = rc[0] < rect_left ? rc[0] : rect_left;
            rect_top = rc[1] < rect_top ? rc[1] : rect_top;
            rect_right = rc[2] > rect_right ? rc[2] : rect_right;
            rect_bottom = rc[3] > rect_bottom ? rc[3] : rect_bottom;
        }

        diigoHighlight.extra.rect = page.getPagePoint(rect_left, rect_top).concat(page.getPagePoint(rect_right, rect_bottom));

        diigoHighlight.groups = [];
        diigoHighlight.comments = [];
        DiigoData.highlights.push(diigoHighlight);
        diigoNetwork.saveHighlightAndStickyNote(diigoHighlight, DiigoData, function (resp, ct, code) {
            console.log('Add highlight successfully. Server code: ' + code);
            if (callback) {
                callback(resp.id);
            }
        });
        page.drawDiigoHighlights();
    };


    diigoAnnotationHelper.emptySelection = function emptySelection() {
        if (window.getSelection) {
            if (window.getSelection().empty) {  // Chrome
                window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) {  // Firefox
                window.getSelection().removeAllRanges();
            }
        } else if (document.selection) {  // IE?
            document.selection.empty();
        }
    };

    diigoAnnotationHelper.updateHighlightColor = function updateHighlightColor(h_id, color) {
        var pageIndex;
        var ann;
        $.each(DiigoData.highlights, function (index, ele) {
            if (ele.id == h_id) {
                if (ele.extra.color == color) {
                    return false;
                }
                DiigoData.highlights[index].extra.color = color;
                ann = DiigoData.highlights[index];
                pageIndex = ann.extra.pageIndex;
                return false;
            }
        });
        if (pageIndex == undefined) {
            return false;
        }
        var page = PDFViewerApplication.pdfViewer._pages[pageIndex];
        diigoNetwork.updateHighlightAndStickyNote(ann, DiigoData, function (resp, ct, code) {
            console.log('Update diigo highlight color successfully. Server code: ' + code);
        });
        page.drawDiigoHighlights();
    };

    diigoAnnotationHelper.addInlineComment = function addInlineComment(h_id, content) {
        var pageIndex;
        var comment = {
            mode: 2, //0:public, 2:private
            content: content
        };

        var update = false;
        var ic_id;
        $.each(DiigoData.highlights, function (index, ele) {
            if (ele.id == h_id) {
                if (ele.comments.length) {
                    ele.comments[0].content = content;
                    update = true;
                    ic_id = ele.comments[0].id;
                } else {
                    ele.comments.push(comment);
                }
                pageIndex = ele.extra.pageIndex;
                return false;
            }
        });

        if (pageIndex == undefined) {
            return false;
        }
        if (update) {
            diigoNetwork.updateComment(ic_id, content, DiigoData, function (resp, ct, code) {
                console.log('Update inline comment successfully. Server code: ' + code);
            })
        } else {
            diigoNetwork.addComment(h_id, comment, DiigoData, function (resp, ct, code) {
                console.log('Add inline comment successfully. Server code: ' + code);
            });
        }

        var page = PDFViewerApplication.pdfViewer._pages[pageIndex];
        page.drawDiigoHighlights();

    };

    diigoAnnotationHelper.deleteInlineComment = function deleteInlineComment(h_id) {
        var pageIndex;
        var ic_id;
        $.each(DiigoData.highlights, function (index, ele) {
            if (ele.id == h_id) {
                if (ele.comments.length) {
                    ic_id = ele.comments[0].id;
                    ele.comments = [];
                }
                pageIndex = ele.extra.pageIndex;
                return false;
            }
        });
        if (pageIndex == undefined) {
            return false;
        }

        diigoNetwork.deleteComment(ic_id, DiigoData, function (resp, ct, code) {
            console.log('Delete inline comment successfully. Server code: ' + code);
        });

        var page = PDFViewerApplication.pdfViewer._pages[pageIndex];
        page.drawDiigoHighlights();
    };

    diigoAnnotationHelper.addFloatnote = function addFloatnote(pageIndex, pos, content) {
        pageIndex = parseInt(pageIndex);
        var page = PDFViewerApplication.pdfViewer._pages[pageIndex];
        var pdf_pos = page.getPagePoint(pos.left, pos.top);
        var id = diigoUtils.md5('' + DiigoData.bookmark.server_url + pageIndex + content + Date.now());
        var floatnote = {};
        floatnote.id = id;
        floatnote.type = 2; //float note type
        floatnote.content = content;
        floatnote.comments = [
            {
                content: content
            }
        ];
        floatnote.extra = {
            left: pdf_pos[0],
            top: pdf_pos[1],
            pageIndex: pageIndex,
            color: DiigoData.currentColor
        };

        DiigoData.floatnotes.push(floatnote);

        diigoNetwork.saveHighlightAndStickyNote(floatnote, DiigoData, function (resp, ct, code) {
            console.log('add floatnote successfully. Server code: ' + code);
        });

        page.drawDiigoFloatnotes();
    };

    diigoAnnotationHelper.addLink = function addLink(ann) {
        var pageId = ann.extra.pageIndex + 1;
        var pageContainer;
        if ($("#annotationView #pageLinkContainer" + pageId).length) {
            pageContainer = $("#annotationView #pageLinkContainer" + pageId);
        } else {
            var div = document.createElement('div');
            pageContainer = $(div);
            pageContainer.attr('id', 'pageLinkContainer' + pageId);
            pageContainer.addClass('page-item');
            pageContainer.attr('data-page-id', pageId);
            pageContainer.append('<h3>Page ' + pageId + '</h3>');
            if ($('#annotationView .page-item').length == 0) {
                $('#annotationView')[0].appendChild(div);
            } else {
                var i = 0;
                $('#annotationView .page-item').each(function () {
                    if ($(this).attr('data-page-id') > pageId) {
                        $(this).before(pageContainer);
                        return false;
                    }
                    i++;
                });

                if (i == $('#annotationView .page-item').length) {
                    $('#annotationView').append(pageContainer);
                }
            }
        }

        var color = ann.extra.color;
        var dest;

        if (ann.type == 9) {
            var elem;
            if (pageContainer.children("a").length != 0) {
                pageContainer.children('a').each(function (i, v) {
                    if (parseFloat($(v).data('dest').split('#')[2]) < parseFloat(ann.extra.rect[1])) {
                        elem = v;
                        return false;
                    }
                })
            }
            dest = (ann.extra.pageIndex + 1) + '#' + (ann.extra.rect[0]) + "#" + (ann.extra.rect[1]);
            if (elem) {
                $('<a href="#" data-dest="' + dest + '" title="' + ann.content + '" class="highlight-link ' + color + '">' + ann.content + '</a>').insertBefore(elem);
                if (ann.comments.length) {
                    $('<a href="#" data-dest="' + dest + '" title="' + ann.comments[0].content + '" class="stickynote-link ' + color + '">' + ann.comments[0].content + '</a>').insertBefore(elem);
                }

            } else {
                pageContainer.append('<a href="#" data-dest="' + dest + '" title="' + ann.content + '" class="highlight-link ' + color + '">' + ann.content + '</a>');
                if (ann.comments.length) {
                    pageContainer.append('<a href="#" data-dest="' + dest + '" title="' + ann.comments[0].content + '" class="stickynote-link ' + color + '">' + ann.comments[0].content + '</a>');
                }
            }
        } else if (ann.type == 2) {
            var elem;
            if (pageContainer.children("a").length != 0) {
                pageContainer.children('a').each(function (i, v) {
                    if (parseFloat($(v).data('dest').split('#')[2]) < parseFloat(ann.extra.top)) {
                        elem = v;
                        return false;
                    }
                })
            }
            dest = (ann.extra.pageIndex + 1) + '#' + (ann.extra.left) + "#" + (ann.extra.top);
            if (elem) {
                $('<a href="#" data-dest="' + dest + '" title="' + ann.comments[0].content + '" class="floatnote-link ' + color + '">' + ann.comments[0].content + '</a>').insertBefore(elem);
            } else {
                pageContainer.append('<a href="#" data-dest="' + dest + '" title="' + ann.comments[0].content + '" class="floatnote-link ' + color + '">' + ann.comments[0].content + '</a>');
            }
        } else {
            //do nothing
        }


    };

    diigoAnnotationHelper.setupLinks = function setupLinks() {
        var that = this;
        $.each(DiigoData.highlights.concat(DiigoData.floatnotes), function (index, ele) {
            that.addLink(ele);
        })
    };

    return diigoAnnotationHelper;

})();

$(document).ready(function () {
    $('body').click(function (e) {
        if (e.target.id != 'popup-message') {
            $('.dropdown').addClass('hidden');
        }
        if (!$('#diigolet-annMenu').hasClass('hovered')) {
            $('#diigolet-annMenu').hide();
        }
    });
    $('#popup-message a').click(function (e) {
        e.stopPropagation();
        return false;
    });
    $('#selectPen').click(function (e) {
        $('#penlist').toggleClass('hidden');
        e.stopPropagation();
    });
    $('#penlist li').click(function (e) {
        e.stopPropagation();
        $(this).addClass('selected').siblings().removeClass('selected');
        var color = $(this).attr('diigocolor');
        DiigoData.currentColor = color;
        $('#add_highlight').removeClass('yellow blue green pink').addClass(color);
        $('#add_note').removeClass('yellow blue green pink').addClass(color);
        $('body').removeClass('yellow blue green pink').addClass(color);
        $(this).parent().addClass('hidden');
    });


    $('#diigolet-annMenu').hover(function () {
        $(this).addClass('hovered');
    }, function (e) {
        $(this).removeClass('hovered');
    });

    $('#diigolet-annMenu-currentColor').bind('click', function () {
        $('#diigolet-annMenu-colorPicker-pdf').toggleClass('hidden');
    });

    $('#diigolet-annMenu-colorPicker-pdf b.ann-colorItem').bind('click', function () {
        var h_id = $(this).parents('#diigolet-annMenu').attr('data-diigo-id');
        var new_color = $(this).attr('color');
        diigoAnnotationHelper.updateHighlightColor(h_id, new_color);
    });

    var copyBtn = document.getElementById('diigolet-annMenu-copy');
    // var copyClient = new ZeroClipboard(copyBtn);
    //
    // var copyWindowTimeout;
    // copyClient.on("aftercopy", function (event) {
    //     $('#diigolet-annMenu').hide();
    //     clearTimeout(copyWindowTimeout);
    //     $('#copied').fadeIn("fast", function () {
    //         copyWindowTimeout = setTimeout(function () {
    //             $('#copied').fadeOut();
    //         }, 2000)
    //     })
    // });

    var copyWindowTimeout;
    $(copyBtn).off('click').on('click', function () {
        copyText($(this).attr('data-clipboard-text'));

        clearTimeout(copyWindowTimeout);
        $('#copied').fadeIn("fast", function () {
            copyWindowTimeout = setTimeout(function () {
                $('#copied').fadeOut();
            }, 2000)
        });
        $(this).parent().hide();
    });


    $('#diigolet-annMenu-add').bind('click', function (e) {
        var annMenu = $(this).parent();
        var id = annMenu.attr('data-diigo-id');
        var color = annMenu.attr('data-diigo-color');
        var pageIndex = annMenu.attr('data-page-index');
        var left = annMenu.attr('data-pos-left');
        var top = annMenu.attr('data-pos-top');
        var note;
        note = $("#pageContainer" + pageIndex).children('div.diigoAnnotationLayer').find('div.diigo-note[data-diigo-id="' + id + '"]');
        if (note && note.length != 0) {
            note.find('.diigo-note-input').val(note.attr('data-origin').replace(/<br \/>/g, "\n"));
        } else {
            note = $('.pdf-area>div.diigo-note').clone(true);
            note.addClass('stickynote');
            note.find('.diigo-note-header span.diigo-note-title').html('Stickynote');
            note.attr('data-origin', '').attr('diigo-note-type', 'stickynote').attr('data-diigo-id', id).removeClass('yellow blue green pink').addClass(color);
            $("#pageContainer" + pageIndex).children('div.diigoAnnotationLayer').append(note);
        }
        if (e.pageX + 300 > window.innerWidth) {
            var left = window.innerWidth - 300;
        } else {
            var left = e.pageX;
        }
        note.css({left: left + "px", top: e.pageY + "px", position: "fixed"});
        note.addClass('new');
        note.fadeIn('fast', function () {
            $(this).find('.diigo-note-input').focus();
        });
        $(this).parent().hide();
    });

    $('#diigolet-annMenu-del').bind('click', function (e) {
        e.preventDefault();
        var id = $(this).parent().attr('data-diigo-id');
        diigoAnnotationHelper.removeHighlight(id);
        $('#diigolet-annMenu').hide();
    });

    $('a.diigo-note-cancel-edit').bind('click', function (e) {
        e.preventDefault();
        $(this).parents('.diigo-note').hide();
    });

    $('#add_highlight').bind('click', function () {
        $('#add_note').removeClass('toggled');
        $(this).toggleClass('toggled');
        $('body').removeClass('add_note').toggleClass('add_highlight').removeClass('yellow blue green pink').addClass(DiigoData.currentColor);
    });

    $('#add_note').bind('click', function () {
        $('#add_highlight').removeClass('toggled');
        $(this).toggleClass('toggled');
        $('body').removeClass('add_highlight').toggleClass('add_note').removeClass('yellow blue green pink').addClass(DiigoData.currentColor);
    })

    $('#viewer').on('mousedown', 'div.textLayer', function (e) {
        if (window.DIIGO_SHARE_KEY || e.which != 1) {
            return true;
        }
        diigoAnnotationHelper.emptySelection();
        $('.diigolet-csm').hide();
    });


    $('#viewer').on('mouseup', 'div.textLayer', function (e) {
        if (window.DIIGO_SHARE_KEY) {
            return false;
        }
        if (e.which != 1) return false;
        var color = DiigoData.currentColor;
        var page = $(this).parent();
        var pageOffset = page.offset();
        var left = e.pageX - pageOffset.left;
        var top = e.pageY - pageOffset.top;
        var self = this;
        var pageIndex = parseInt(page.attr('id').match(/pageContainer(\d+)/)[1]) - 1;
        if ($('body').hasClass('add_note')) {
            var note;
            note = page.children('div.diigoAnnotationLayer').children('div.diigo-note');
            if (note && note.length != 0) {
                //do nothing
            } else {
                note = $('.pdf-area>div.diigo-note').clone(true);
                note.addClass('floatnote');
                note.find('.diigo-note-header span.diigo-note-title').html('Floatnote');
            }
            note.find('textarea.diigo-note-input').val("");
            note.attr('data-diigo-id', '').attr('data-page-index', pageIndex).attr('diigo-note-type', 'floatnote').removeClass('yellow blue green pink').addClass(color).css({
                left: left + 'px',
                top: top + 'px'
            });
            page.children('div.diigoAnnotationLayer').append(note);
            $('#add_note')[0].click();
            note.addClass('new');
            note.fadeIn(100, function () {
                $(this).find('.diigo-note-input').focus();
                $(this).draggable({handle: '.diigo-note-header', containment: "parent", opacity: 0.8});
            });

            return false;
        }

        var selection = window.getSelection();
        if (!selection || selection.toString() == "") {
            return false;
        }
        var rg = selection.getRangeAt(0);
        if ($('body').hasClass('add_highlight')) {
            diigoAnnotationHelper.appendHighlight(pageIndex, rg);
            diigoAnnotationHelper.emptySelection();
        } else {
            var res = diigoAnnotationHelper.parseRange(pageIndex, rg);
            var quadRects = res.rects;
            var rect_left = quadRects[0][0], rect_top = quadRects[0][1], rect_right = quadRects[0][2], rect_bottom = quadRects[0][3];
            left = (rect_right - rect_left) / 2.0 + rect_left - 60;
            top = rect_top;
            var diigoletCSM = page.find('.diigolet-csm');
            if (diigoletCSM.length == 0) {
                diigoletCSM = $('body .diigolet-csm').clone(true, true);
                diigoletCSM.appendTo(page);
            }

            // copyText(highlightedText);
            // copyBtn.setAttribute('data-clipboard-text', highlightedText);
            // var copyClient = new ZeroClipboard(copyBtn);
            // var copyWindowTimeout;
            // copyClient.on("aftercopy", function (event) {
            //     diigoletCSM.hide();
            //     clearTimeout(copyWindowTimeout);
            //     $('#copied').fadeIn("fast", function () {
            //         copyWindowTimeout = setTimeout(function () {
            //             $('#copied').fadeOut();
            //         }, 2000)
            //     })
            // });
            diigoletCSM.find('.diigolet-csm-color').hide();
            diigoletCSM.css({
                left: left + 'px',
                top: top - 45 + 'px'
            }).addClass(color).show();
            var copyBtn = diigoletCSM.find('.diigolet-csm-copy-wrapper')[0];
            var highlightedText = $('<textarea />').html(res.text).text();
            // copyBtn.setAttribute('data-copyText', highlightedText);

            var copyWindowTimeout;
            $(copyBtn).off('click').on('click', function () {
                copyText(highlightedText);

                clearTimeout(copyWindowTimeout);
                $('#copied').fadeIn("fast", function () {
                    copyWindowTimeout = setTimeout(function () {
                        $('#copied').fadeOut();
                    }, 2000)
                });
                $(this).parent().hide();
            });
        }
    });

    $('.diigolet-csm-highlight').hover(function () {
        $(this).addClass('hovered');
        $(this).next('.diigolet-csm-color').show();
    }, function () {
        $(this).removeClass('hovered');
        var colorChooser = $(this).next('.diigolet-csm-color');
        window.setTimeout(function () {
            if (!colorChooser.hasClass('hovered')) {
                colorChooser.hide();
            }
        }, 200)
    });


    $('.diigolet-csm .diigolet-csm-color').hover(function () {
        $(this).addClass('hovered');
    }, function () {
        $(this).removeClass('hovered');
        var highlightIcon = $(this).prev('.diigolet-csm-highlight');
        var that = this;
        window.setTimeout(function () {
            if (!highlightIcon.hasClass('hovered')) {
                $(that).hide();
            }
        }, 200);
    });

    $('#viewer').on('mousedown', '.diigolet-csm-highlight,.diigolet-csm-coloritem', function () {
        var selection = window.getSelection();
        if (!selection || selection.toString() == "") {
            return false;
        }

        if (!(permissions && permissions.pdfPermission.pdfPermission)) {
            $(this).parents('.diigolet-csm').hide();
            diigoModal.show('upgrade');
            return;
        }

        var rg = selection.getRangeAt(0);
        var pageIndex = parseInt($(this).parents(".page").attr('id').match(/pageContainer(\d+)/)[1]) - 1;
        DiigoData.currentColor = $(this).data('color');
        diigoAnnotationHelper.appendHighlight(pageIndex, rg);
        diigoAnnotationHelper.emptySelection();
        $(this).parents('.diigolet-csm').hide();
    });

    $('#viewer').on('click', '.diigolet-csm-search', function () {
        var selection = window.getSelection();
        if (!selection || selection.toString() == "") {
            return false;
        }
        var rg = selection.getRangeAt(0);
        var pageIndex = parseInt($(this).parents(".page").attr('id').match(/pageContainer(\d+)/)[1]) - 1;
        var res = diigoAnnotationHelper.parseRange(pageIndex, rg);
        var text = res.text;
        window.open("http://www.diigo.com/search/g?q=" + encodeURIComponent(text), "_blank");
    });

    $('#viewer').on('mousedown', '.diigolet-csm-highlightAndComment', function () {
        var selection = window.getSelection();
        if (!selection || selection.toString() == "") {
            return false;
        }

        if (!(permissions && permissions.pdfPermission.pdfPermission)) {
            $(this).parents('.diigolet-csm').hide();
            diigoModal.show('upgrade');
            return;
        }
        var rg = selection.getRangeAt(0);
        var pageIndex = parseInt($(this).parents(".page").attr('id').match(/pageContainer(\d+)/)[1]) - 1;
        diigoAnnotationHelper.emptySelection();
        var diigoletCSM = $(this).parents('.diigolet-csm');
        var left = diigoletCSM.css('left');
        var top = parseInt(diigoletCSM.css('top')) + 40 + 'px';
        diigoletCSM.hide();
        var page = $(this).parents('.page');
        diigoAnnotationHelper.appendHighlight(pageIndex, rg, function (id) {
            var note;
            note = page.children('div.diigoAnnotationLayer').children('div.diigo-note[data-diigo-id="' + id + '"]');
            if (note && note.length != 0) {
                //do nothing
            } else {
                note = $('.pdf-area>div.diigo-note').clone(true);
                note.addClass('stickynote');
                note.find('.diigo-note-header span.diigo-note-title').html('Stickynote');
                note.attr('data-origin', '').attr('diigo-note-type', 'stickynote').attr('data-diigo-id', id).removeClass('yellow blue green pink').addClass(DiigoData.currentColor).css({
                    left: left,
                    top: top
                });
                page.children('div.diigoAnnotationLayer').append(note);
            }
            note.addClass('new');
            note.fadeIn('fast', function () {
                $(this).find('.diigo-note-input').focus();
                $(this).draggable({handle: '.diigo-note-header', containment: "parent", opacity: 0.8});
            });
        });
    });

    $('.diigo-note').hover(function () {
        $(this).addClass('hovered');
    }, function (e) {
        $(this).removeClass('hovered');
        if ($(e.relatedTarget).hasClass('div_floatnote')) {
            return false;
        }
        if ($(this).attr('data-origin') && $(this).attr('data-origin') != $(this).find('.diigo-note-input').val()) {
            //do nothing
        } else {
            var self = this;
            window.setTimeout(function () {
                var textarea = $(self).find(".diigo-note-input");
                if (textarea.is(":focus")) {
                    // do nothing
                } else {
                    if (!$(self).hasClass('hovered')) {
                        $(self).find('.diigo-note-colorPicker').addClass('hidden');
                        $(self).hide();
                    }
                }
            }, 300)
        }
    });

    $('.diigo-note-save').bind('click', function (e) {
        e.preventDefault();
        var note = $(this).parents('.diigo-note');
        var type = note.attr('diigo-note-type');
        var id = note.attr('data-diigo-id');
        var content = note.find('.diigo-note-input').first().val();
        if (type == 'stickynote') {
            diigoAnnotationHelper.addInlineComment(id, content);
        }
        else {
            if (id) {
                diigoAnnotationHelper.updateFloatnoteContent(id, content);
            } else {
                var top = note.css('top');
                var left = note.css('left');
                var pageIndex = note.attr('data-page-index');
                diigoAnnotationHelper.addFloatnote(pageIndex, {left: parseInt(left), top: parseInt(top)}, content);
            }
        }
    });

    $('.diigo-note-delete').bind('click', function (e) {
        e.preventDefault();
        var note = $(this).parents('.diigo-note');
        var type = note.attr('diigo-note-type');
        var id = note.attr('data-diigo-id');
        if (type == 'stickynote') {
            diigoAnnotationHelper.deleteInlineComment(id);
        } else {
            diigoAnnotationHelper.removeFloatnote(id);
            note.fadeOut('fast');
        }
    });

    $('.diigo-note-currentColor').bind('click', function (e) {
        e.stopPropagation();
        $(this).siblings('.diigo-note-colorPicker').toggleClass('hidden');
    });

    $('.dlg-colorItem').bind('click', function (e) {
        e.stopPropagation();
        var note = $(this).parents('.diigo-note');
        var id = note.attr('data-diigo-id');
        var type = note.attr('diigo-note-type');
        var color = $(this).attr('color');
        if (id) {
            if (type == 'stickynote') {
                diigoAnnotationHelper.updateHighlightColor(id, color);
            } else {
                diigoAnnotationHelper.updateFloatnoteColor(id, color);
            }
        } else {

        }
    });

    $('#annotationView').on('click', 'a', function (e) {
        e.preventDefault();
        var dest = $(this).attr('data-dest');
        dest = dest.split('#');
        dest = [
            parseInt(dest[0]) - 1,
            {name: 'XYZ'},
            null,
            parseInt(dest[2]) + 5,
            null
        ];
        PDFViewerApplication.pdfLinkService.navigateTo(dest);
    })

    $('#edit_window').draggable({handle: '.edit_header', containment: "parent", opacity: 0.95});
    $('#share-window').draggable({handle: '.edit_header', opacity: 0.95});
    $('#save').click(function (e) {
        // $("#edit_window").toggleClass('hidden');
        diigoModal.show('save');
    });

    $('#edit').click(function () {
        diigoModal.show('edit');
    });

    $('#wCloseLink,#cancel_save').click(function (e) {
        e.preventDefault();
        $('#edit_window').addClass('hidden');
    });
    $('#shareCloseLink').click(function (e) {
        e.preventDefault();
        $('#share-window').addClass('hidden');
    });

    $('#save-pdf').on('click', function () {


        if (!(permissions && permissions.pdfPermission.pdfPermission)) {
            diigoModal.hide();
            diigoModal.show('upgrade');
            return;
        }

        var that = this;
        var title = $('#bm-title').val();
        var description = $('#bm-desc').val();
        var tags = $.trim($('#bm-tags').val());
        var link_id = DiigoData.bookmark.link_id;

        var list = $('#diigobm-list').find('.content').attr('data-id');
        var params = {link_id: link_id, title: title, description: description, tags: tags, lists: list};

        if (!DiigoData.bookmark.saved) {
            $(this).text('Saving ...').addClass('disabled');

            diigoNetwork.pdfCreateItem(params, DiigoData, function () {
                console.log('Create pdf item successfully');
                $('#save').removeClass('disabled');
                $(that).text('Save').removeClass('disabled');

                // update buttons
                $('#save').hide();
                $('#edit, #download, #share').show();

                diigoModal.hide();
            }, function () {
                $(that).text('Save').removeClass('disabled');
            });

            return;
        }

        $.ajax({
            type: "post",
            url: window.DIIGO_REQUEST_SERVER + "/item/save/pdf",
            data: $.param(params),
            beforeSend: function (XMLHttpRequest) {
                $(that).text('Saving ...').addClass('disabled');
            },
            success: function (data, textStatus) {
                $('#bm-title').val(params.title);
                $('#toolbarViewer>.title').text(params.title);
                $(that).removeClass('disabled').text('Save');
                diigoModal.hide();
            },
            complete: function (XMLHttpRequest, textStatus) {
                //HideLoading();
            },
            error: function () {
                $(that).text('Save').removeClass('disabled');
                //请求出错处理
            }
        });

    });

    $('#updrade-btn').on('click', function () {
        // diigoModal.show('upgrade');
    });

    if (permissions && permissions.pdfPermission.pdfPermission) {
        $('#updrade-btn').hide();
    }


    var OriginTags = Bg.GlobalData.myTags;
    var tags = [];

    for (var i = 0; i < OriginTags.length; i++) {
        tags.push(OriginTags[i])
    }

    var tags = diigoUtils.removeFromArray('no_tag', tags);
    console.log(tags);


    var options = {
        resultsClass: 'diigolet ac_results ac_search',
        data: tags, mode: 'multiple',
        multipleSeparator: ' ,',
        id: 'diigolet-ac'
    }
    try {
        ac = new AutoComplete('#bm-tags', options);
    }
    catch (e) {
        console.log(e);
    }

    $('#save_pdf').click(function () {
        var title = $('#bTxtTitle').val();
        var description = $('#bTxtDesc').val();
        var tags = $.trim($('#bTxtTags').val());
        var link_id = DiigoData.bookmark.link_id;

        var list = $('#addToListSelector-pdf').find(":selected").val();
        var params = {link_id: link_id, title: title, description: description, tags: tags, lists: list};

        if (!DiigoData.bookmark.saved) {
            $('#save_pdf').html('Saving..');
            $('#save_pdf').attr('disabled', true);
            diigoNetwork.pdfCreateItem(params, DiigoData, function () {
                console.log('Create pdf item successfully');
                $('#save').addClass('saved');
                $('#save_pdf').html('Saved');
                $('#save_pdf').attr('disabled', false);
                window.setTimeout(function () {
                    $('#edit_window').addClass('hidden');
                    $('#save_pdf').html('Save');
                }, 1000);
            });
            return false;
        }

        $.ajax({
            type: "post",
            url: window.DIIGO_REQUEST_SERVER + "/item/save/pdf",
            data: $.param(params),
            beforeSend: function (XMLHttpRequest) {
                $('#save_pdf').html('Saving..');
                $('#save_pdf').attr('disabled', true);
            },
            success: function (data, textStatus) {
                $('#save_pdf').html('Saved');
                $('#save_pdf').attr('disabled', false);
                window.setTimeout(function () {
                    $('#edit_window').addClass('hidden');
                    $('#save_pdf').html('Save');
                }, 1000);
            },
            complete: function (XMLHttpRequest, textStatus) {
                //HideLoading();
            },
            error: function () {
                //请求出错处理
            }
        });

    });

    $('#open-with-default').bind('click', function () {
        window.open(window.DIIGO_PDF_URL, '_blank');
    });

    $('#logo').bind('click', function () {

        window.open(window.DIIGO_REQUEST_SERVER, '_blank');
    });

    var tt;
    $('#screenshot').bind('click', function (e) {
        if (tt) {
            clearTimeout(tt);
        }
        e.stopPropagation();
        if ($('div#diigo-chrome-installed').length > 0) {
            //do nothing
        } else {
            if (window.navigator.userAgent.match(/firefox/i)) {
                $('#popup-message').html('Get <a href="https://www.diigo.com/tools/toolbar?client=ff">diigo firefox toolbar</a> to take capture.').removeClass('hidden');
            } else {
                $("#popup-message").html('Get <a onclick="installExt(event);" href="https://chrome.google.com/webstore/detail/diigo-web-collector-captu/oojbgadfejifecebmdnhhkbhdjaphole">diigo chrome extension</a> to take capture.').removeClass('hidden');
            }
            tt = window.setTimeout(function () {
                $("#popup-message").addClass('hidden');
            }, 5000);
        }
    });

    $('#download').on('click', function () {
        diigoModal.show('download');
    });

    $('#download-original').on('click', function () {
        PDFViewerApplication.download();
    });

    $('#download-ann').on('click', function () {
        PDFView.pdfDocument.getData().then(
            function (data) {
                var blob = PDFJS.createBlob(data, {type: 'application/pdf'});
                var obj = {
                    ann: JSON.stringify({
                        bm: DiigoData.bookmark,
                        highlights: DiigoData.highlights,
                        floatnotes: DiigoData.floatnotes
                    }),
                    name: document.title + '.pdf',
                    file: blob
                };

                Web.downloadAnnotatedPdf(obj).then(function (res) {
                    var url = window.URL.createObjectURL(res);
                    var a = document.createElement('A');
                    a.href = url;
                    a.download = document.title + ".pdf";
                    a.click();
                    window.URL.revokeObjectURL(url);
                }).catch(function (err) {
                    console.error(err)
                });
            }
        )
    });

    $('#share').bind('click', function () {
        if (DiigoData.bookmark.saved) {
            $('#share-window').removeClass('hidden');
            diigoModal.show('share');
            if (DiigoData.bookmark.shared_url) {
                $('#share-url').val(DiigoData.bookmark.shared_url);
                $('#share-url').focus();
                $('#share-url').select();
                return false;
            }
            $.ajax({
                type: "get",
                url: window.DIIGO_REQUEST_SERVER + "/item/get_share_url",
                data: $.param({
                    link_id: DiigoData.bookmark.link_id
                }),
                dataType: 'json',
                beforeSend: function (XMLHttpRequest) {
                    $('#share-url').val('loading..');
                },
                success: function (data, textStatus) {
                    DiigoData.bookmark.shared_url = data.shared_url;
                    $('#share-url').val(data.shared_url);
                    $('#share-url').focus();
                    $('#share-url').select();
                },
                complete: function (XMLHttpRequest, textStatus) {
                    //HideLoading();
                },
                error: function () {
                    //请求出错处理
                }
            });
        } else {

        }
    });

    $('#refresh-outliner').on('click', function () {
        var that = this;
        $(this).addClass('processing');
        Web.refreshStuff().then(function (data) {
            updateLists({myList: data.lists, outliners: data.outliners});
            $(that).removeClass('processing');
        });

    });

    $('#refresh-group').on('click', function () {
        var that = this;
        $(this).addClass('processing');
        Web.refreshStuff().then(function (data) {
            updateGroups(data.groups);
            $(that).removeClass('processing');
        });

    });

    $('.social-btn').on('click', function () {
        if ($(this).hasClass('twitter')) {
            share('twitter');
        } else if ($(this).hasClass('facebook')) {
            share('facebook');
        } else if ($(this).hasClass('g-plus')) {
            share('g-plus');
        }

    });

    $('#diigobm-list-addBtn').on('click', function () {
        var that = this;
        if ($(this).parent().hasClass('processing')) {
            return;
        }
        var listName = $('#diigobm-list-addInput').val(),
            alertTip = $('#diigobm-list-add .diigo-alert-tip'),
            lists = [],
            length = Bg.GlobalData.outliners.length,
            i;

        for (i = 0; i < length; i++) {
            lists.push(Bg.GlobalData.outliners[i].title);
        }


        // input vadidate
        if (listName.match(/^\s*$/)) {
            $('#diigobm-list-addInput').focus();
            return;
        } /*else if (/[^a-z0-9\_\-]+/.test(listName)) {
         alertTip.show().find('span').text('Invalid name');
         return;
         }*/ else if ($.inArray(listName, lists) !== -1) {
            // alertTip.show().find('span').text('Name existed !');
            return;
        }

        $(this).parent().addClass('processing');

        Web.createList(listName).then(function (data) {
            console.log(data);
            $(that).parent().removeClass('processing');
            updateLists({myList: data.lists, outliners: data.outliners});
            // select the new created outliner
            var $listSelect = $('#diigobm-list');
            $listSelect.find('.content').text(data.newOutliner.title).attr('data-id', data.newOutliner.id);
            $listSelect.removeClass('focused');
            $listSelect.find('.add-box').hide().find('input').val('');
            $listSelect.find('.search-box').show();
        });
        // getSelectedTab(function (tab) {
        //     chrome.tabs.sendMessage(tab.id, {name: 'createList', data: listName});
        // });
    });


    $('#download_ann').click(function () {
        if (tt) {
            clearTimeout(tt);
        }
        $.ajax({
            type: "post",
            dataType: "json",
            url: "/item/pdf/download/" + window.DIIGO_LINK_ID,
            beforeSend: function (XMLHttpRequest) {
            },
            success: function (data, res) {
                var message;
                if (data.code == 1) {
                    message = "Submitted! You can go to <a target='_blank' href='/tools/pdf_export?t=" + data.time + "'><strong>tools->PDF Export</strong></a> to download your file when the file is processed.";
                    $("#popup-message").html(message).removeClass('hidden');
                    tt = window.setTimeout(function () {
                        $("#popup-message").addClass('hidden');
                    }, 5000);
                } else if (data.code == 2) {
                    message = "You have just submitted a downloading request. \nCheck your downloads <a target='_blank' href='/tools/pdf_export?t=" + data.time + "'><strong>tools->here</strong></a>.";
                    $("#popup-message").html(message).removeClass('hidden');
                    tt = window.setTimeout(function () {
                        $("#popup-message").addClass('hidden');
                    }, 5000);
                } else {
                    message = "You have no annotations. Just click the dowload button on the right.";
                    $("#popup-message").addClass('failed').html(message).removeClass('hidden');
                    tt = window.setTimeout(function () {
                        $("#popup-message").addClass('hidden');
                    }, 5000);
                }
            },
            complete: function (XMLHttpRequest, res) {

            },
            error: function () {

            }
        });
    });

    $('#share-link').bind('click', function () {
        $(this).select();
    });

    $('#share-chooser a').bind('click', function (e) {
        e.preventDefault();
        var share_type = $(this).attr('data-share-type');
        share(share_type);
    });
});

function share(share_way) {
    var share_link = DiigoData.bookmark.shared_url;
    var share_text = DiigoData.bookmark.title;
    var to_url = '';
    if (share_way == 'twitter') {
        var twitter_share = 'https://twitter.com/share';
        to_url = twitter_share + "?url=" + encodeURIComponent(share_link) + '&text=' + encodeURIComponent(share_text)
    } else if (share_way == 'facebook') {
        var facebook_share = 'http://www.facebook.com/sharer.php';
        to_url = facebook_share + "?src=bm&u=" + encodeURIComponent(share_link) + '&t=' + encodeURIComponent(share_text)
    } else if (share_way == 'g-plus') {
        var g_plus_share = 'https://plus.google.com/share?url=';
        to_url = g_plus_share + encodeURIComponent(share_link);
    } else {
        to_url = "mailto:?subject=Check this pdf&body=" + encodeURIComponent(share_text) + "%0A" + encodeURIComponent(share_link);
    }


    window.open(to_url, '', 'left=300,top=100,width=500,height=500,toolbar=0,resizable=0,menubar=0,location=0,status=0,scrollbars=yes')

}
function inList(id) {
    var _lists = DiigoData.bookmark.lists;
    return diigoUtils.some(_lists, function (list) {
        return list.id == id;
    });
}


function inOutliner(id) {
    var outliners = DiigoData.bookmark.outliners;
    return diigoUtils.some(outliners, function (outliner) {
        return outliner.id == id;
    });
}


function inGroup(name) {
    var groups = DiigoData.bookmark.groups;
    return diigoUtils.some(groups, function (group) {
        return group.name == name;
    });
}


function updateGroups(groups) {
    var _groups = groups.filter(function (g) {
        return g.access_mode < 5;
    });


    var _teams = groups.filter(function (g) {
        console.log(g.access_mode)
        return g.access_mode >= 5;
    });

    console.log(_groups, _teams);

    var container = $('#diigobm-group').find('.item-container');

    container.empty();
    // uplate team
    if (_teams.length) {
        $('<div class="menu-title">Teams</div>').appendTo(container);

        diigoUtils.forEach(_teams, function (index, o) {
            var displayName = inGroup(o.name) ? o.displayName + ' (shared)' : o.displayName;
            $('<div class="menu-item" data-id="' + o.name + '">' + displayName + '</div>').appendTo(container);
        })
    }

    // update group
    if (_groups.length) {
        $('<div class="menu-title">Groups</div>').appendTo(container);
        diigoUtils.forEach(_groups, function (index, l) {
            var displayName = inGroup(l.name) ? l.displayName + ' (shared)' : l.displayName;
            $('<div class="menu-item" data-id="' + l.name + '">' + displayName + '</div>').appendTo(container);
        });
    }
}

function updateLists(data) {

    var lists = data.myList,
        outliners = data.outliners,
        container = $('#diigobm-list').find('.item-container');

    container.empty();
    // uplate outliner
    if (outliners.length) {
        $('<div class="menu-title">Outliners</div>').appendTo(container);

        diigoUtils.forEach(outliners, function (index, o) {
            var title = inOutliner(o.id) ? o.title + ' (added)' : o.title;
            $('<div class="menu-item" data-id="' + o.id + '">' + title + '</div>').appendTo(container);
        })
    }

    // update list
    if (lists.length) {
        $('<div class="menu-title">Lists</div>').appendTo(container);
        diigoUtils.forEach(lists, function (index, l) {
            var title = inList(l.id) ? l.title + ' (added)' : l.title;
            $('<div class="menu-item" data-id="' + l.id + '">' + title + '</div>').appendTo(container);
        });
    }
}

