/*
 * Diigo inc.
 * PDF reader and annotations
 *
 * use for send and receive data from server
 *
 * Rick
 * August 2012
 *
 * */


'use strict';

var diigoNetwork = (function diigoNetworkClosure() {
    function diigoNetwork() {

    };

    diigoNetwork.invoke = function invoke(cmd, data, context, callback) {
        if(window.DIIGO_SHARE_KEY){
            if(cmd!='bm_loadBookmark'){
                return false;
            }
        }else{
            if (!diigoUtils.isDiigoSignedIn()) {
                TODO('diigoNetwork need signin: ' + cmd + ' ' + JSON.stringify(data));
                return false;
            }
        }


        var z = this;
        var protocolVersion = 13;
        var paramObj = {
            cmd: cmd,
            v: protocolVersion,
            _nocache: Math.random(),
            json: JSON.stringify(data),
            user: context.user
        };

        var req = new XMLHttpRequest();

        var url = diigoUtils.showTpl(diigoUtils.getRequestURL(), {
            pv: protocolVersion,
            cv: window.DIIGO_PDFREADER_VERSION,
            user: context.user,
            cmd: cmd,
            from: 'pdfjs'
        });
        req.open('POST', url);
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {

                    try {
                        var json = JSON.parse(req.responseText);
                    } catch (e) {
                        return;
                    }
                    log("json.cmd responseText: " + req.responseText);
                    if (json.code == -1) {
                        diigoUtils.signoutDiigoAccount();
                        return;
                    } else if (json.code == 1) {
                        //update sign in state using this "natural" event
                        if (json.user != null && (json.user || context.user) && json.user != context.user) {
                            diigoUtils.signoutDiigoAccount();
                            return;
                        }
                        z['callback_' + json.cmd + '_success'].call(z, json.result, context);
                    } else {
                        console.error('[WebAPI response]' + json.cmd + ' failed!' + json);
                    }

                    if (callback) {

                        callback(json.result, context, json.code);
                    };
                } else {
                    if (callback) {
                        callback(null, context, 0);
                    };
                }
            }
        };

        log('[WebAPI request]' + url + '\r\n' + cmd + ' : ' + JSON.stringify(paramObj));
        //fork to avoid problems with closed calling window
        //see Ajax failure after window closes in my dev notes
        req.send(diigoUtils.toQueryString(paramObj));
    };


    diigoNetwork.invokeUpload = function invokeUpload(cmd, param, content, context, callback) {

        if (!diigoUtils.isDiigoSignedIn()) {
            TODO('diigoNetwork need signin: ' + cmd + ' ' + JSON.stringify(data));
            return false;
        }
        var z = this;
        var protocolVersion = 13;

        var paramObj = {
            cmd: cmd,
            v: protocolVersion,
            _nocache: Math.random(),
            json: JSON.stringify(param),
            user: DiigoData.user,
            from: 'pdfjs'
        };

        var req = new XMLHttpRequest();

        var url = diigoUtils.showTpl(diigoUtils.getRequestURL(), {
            pv: protocolVersion,
            cv: window.DIIGO_PDFREADER_VERSION,
            user: DiigoData.user,
            cmd: cmd,
            from: 'pdfjs'
        });

        url += ("?" + diigoUtils.toQueryString(paramObj));

        log('[WebAPI request]' + url);

        req.open('POST', url);
        req.setRequestHeader('Content-Type', 'application/pdf');


        req.onreadystatechange = function(aEvt) {

            if (req.readyState == 4) {
                if (req.status == 200) {
                    try {
                        var json = JSON.parse(req.responseText);
                    } catch (e) {
                        return;
                    }
                    log("json.cmd responseText: " + req.responseText);

                    if (json.code == -1) {
                        diigoUtils.signoutDiigoAccount();
                        return;
                    } else if (json.code == 1) {
                        //update sign in state using this "natural" event
                        if (json.user != null && (json.user || context.user) && json.user != context.user) {
                            diigoUtils.signoutDiigoAccount();
                            return;
                        }
                        z['callback_' + json.cmd + '_success'].call(z, json.result, context);
                    } else {
                        console.error('[WebAPI response]' + json.cmd + ' failed!' + json);
                    }

                    if (callback) {
                        callback(json.result, context, json.code);
                    };
                } else {
                    if (callback) {
                        callback(null, context, 0);
                    };
                }
            }
        };

        req.upload.onload = function(event){
            document.getElementById('upload-status').className = 'hidden';
        };

        req.upload.onprogress = function(event) {
            if (event.lengthComputable) {
                var percentComplete = event.loaded / event.total * 100 + '%';
                document.getElementById('progress-bar').style.width=percentComplete;
            }
        };

        req.upload.onloadstart = function(event){
            document.getElementById('popup-message').innerHTML='You can still make annotations while uploading..';
            document.getElementById('popup-message').className = 'dropdown';
            window.setTimeout(function(){
                document.getElementById('popup-message').className = 'dropdown hidden';
            },5000);
            document.getElementById('upload-status').className = '';
        }

        //log('[WebAPI request]'+url+'\r\n'+cmd+' : '+diigoUtils.toQueryString(paramObj));
        //fork to avoid problems with closed calling window
        //see Ajax failure after window closes in my dev notes
        req.send(content);
    };

    /**
     *
     * @param {Object} data {url: '', what: 'a b c', force: true/false}
     * @param {Object} context
     * @param {Object} callback
     */
    diigoNetwork.bm_loadBookmark = function bm_loadBookmark(dataContext, what, callback) {

        if (typeof what == 'string') {
            what = what.split(/\s+/);
        } else if (!what || !(what instanceof Array)) {
            what = [];
        }

        if (what.length <= 0) {
            what.push('annotations');
            what.push('bookmarkInfo');
        }



        var data = {
            url: dataContext.bookmark.url,
            what: what.join(' '),
            page_type: 'pdf',
            pdf_md5: dataContext.file_md5,
            link_id:dataContext.bookmark.link_id
        };

        if(window.DIIGO_SHARE_KEY){
            data['share_key'] = window.DIIGO_SHARE_KEY;
        }

        if (window.DIIGOPERMALINKPARAMS) {
            data.permalinkParams = window.DIIGOPERMALINKPARAMS;
        }

        this.invoke(
            'bm_loadBookmark',
            data,
            dataContext,
            callback
        );
    };

    diigoNetwork.callback_bm_loadBookmark_success = function callback_bm_loadBookmark_success(data, context) {

        var bm = context.bookmark;
        bm.server_url = data.url != null ? data.url : "";
        bm.server_urlId = data.urlId;
        bm.annotated = data.annotated;
        bm.groups = data.groups;
        bm.mode = data.mode;
        bm.saved = data.saved;
        bm.uploaded = data.pdf_uploaded;
        if(!bm.link_id){
            bm.link_id = data.link_id;
        }

        if (bm.saved) {

            if (data.bookmarkInfo) {
                diigoUtils.extendFiltered(bm, data.bookmarkInfo, function(k) {
                    return 'title mode tags unread description datetime onlyInGroup lists'.split(' ').indexOf(k) > -1;
                });
            }
        }

        if (data.annotations) {
            data.annotations.forEach(function(v) {
                var ann = diigoUtils.extendFiltered({
                    saved: true
                }, v, function(k) {
                    return 'id user realName mode type content datetime extra groups onlyInGroup comments'.split(' ').indexOf(k) > -1;
                });
                if (ann.type == 9) {
                    if(ann.comments && ann.comments.length>0){
                        ann.comments[0].content = ann.comments[0].content.replace(/<.*?>/g,'');
                    }
                    context.highlights.push(ann);
                }
                if (ann.type == 2) {
                    ann.content = ann.content.replace(/<.*?>/g,'');
                    context.floatnotes.push(ann);
                }
            });
        }
    };

    diigoNetwork.loadMyStuff = function loadMyStuff(whatToLoad, context, callback) {
        this.invoke('user_loadMyStuff', {
            what: whatToLoad
        }, context, callback);
    };

    diigoNetwork.callback_user_loadMyStuff_success = function callback_user_loadMyStuff_success(data, context) {
        diigoUtils.extendFiltered(context.env, data, function(k) { /*myCustomizedSearch*/
            return 'myTags myGroups permissions myBookmarkLists myProfile'
                .split(' ').indexOf(k) > -1;
        });
    };


    diigoNetwork.loadRecommendedTags = function loadRecommendedTags(context, callback) {
        this.invoke('bm_loadRecommendedTags', {
            url: context.url,
            title: document.title
        }, context, callback);
    };

    diigoNetwork.callback_bm_loadRecommendedTags_success = function callback_bm_loadRecommendedTags_success(data, context) {
        if (context) {
            context.recommendedTagsLoaded = true;
            context.recommendedTags = data.tags;
        }
    };

    diigoNetwork.loadGroupTagsDictionary = function loadGroupTagsDictionary(groups, context, callback) {
        this.invoke('bm_loadGroupTagsDictionary', {
            groups: groups
        }, context, callback);
    };

    diigoNetwork.callback_bm_loadGroupTagsDictionary_success = function callback_bm_loadGroupTagsDictionary_success(data, context) {

        if (!context.env.groupTagsDict) {
            context.env.groupTagsDict = {};
        }
        diigoUtils.each(data, function(tags, groupName) {
            context.env.groupTagsDict[groupName] = tags;
        });
    };

    diigoNetwork.pdfCreateItem = function pdfCreateItem(params, context, callback) {
        if(context.file_size>30*1024*1024){
            document.getElementById('popup-message').innerHTML='Your PDF is too large. Maximum size allowed: 30M.';
            document.getElementById('popup-message').className = 'dropdown';
            window.setTimeout(function(){
                document.getElementById('popup-message').className = 'dropdown hidden';
            },5000);
            return false;
        }
        var bm = context.bookmark;
        
        if(bm.saving == true || bm.saved == true){
            return false;
        }
        var tag='';
        var open=false;
        var tags = params.tags||'';
        for(var i=0;i<tags.length;i++){
            if(tags[i]==' ' && !open){
                bm.tags.push(tag);
                tag='';
            }else{
                if(tags[i]=='"'){
                    if(open==false){
                        open=true;
                    }else{
                        open=false;
                    }
                }else{
                    tag+=tags[i] 
                }
            }
        }
        if(tag){
            bm.tags.push(tag);
        }
        if(params.lists){
            bm.lists.push(parseInt(params.lists));
        }
        
        if(!params.title){
            params.title = document.title;
        }
        var data = {
            mode: bm.mode,
            tags: bm.tags,
            src_url: bm.url,
            src_title: params.title,
            src_description: params.description,
            title: params.title,
            description: params.description,
            file_md5: context.file_md5,
            lists:bm.lists
        };

        bm.saving = true;
        this.invoke('pdf_createItem', data, context, callback);

    };

    diigoNetwork.callback_pdf_createItem_success = function callback_pdf_createItem_success(data, context) {
        if (!context) return;

        var bm = context.bookmark;

        bm.saving = false;
        bm.saved = true;
        bm.link_id = data.linkId;
        bm.server_url = data.diigo_url;
        bm.server_urlId = data.diigo_urlId;
        
        document.getElementById('save').className = document.getElementById('save').className + ' saved'; 
        this.uploadPDFContent(context,function(){
            console.log('upload content successfully');     
        });
        
    };

    diigoNetwork.uploadPDFContent = function uploadPDFContent(context, callback) {

        if (!context.bookmark.saved) {
            var z = this;

            try {
                diigoNetwork.pdfCreateItem({
                    mode: 2,
                    title:document.title
                }, context, function(resp, ct, code) {
                    z.invokeUpload('pdf_uploadContent', {
                        link_id: ct.bookmark.link_id,
                        pdf_md5: ct.file_md5,
                        file_name: ct.file_title
                    }, ct.file_content.buffer, ct, callback);
                });

            } catch (e) {
            }
        } else {

            this.invokeUpload('pdf_uploadContent', {
                link_id: context.bookmark.link_id,
                pdf_md5: context.file_md5,
                file_name: context.file_title
            }, context.file_content.buffer, context, callback);
        }



    };

    diigoNetwork.callback_pdf_uploadContent_success = function callback_pdf_uploadContent_success(data, context) {
        if (!context) return;
        var bm = context.bookmark;
        bm.uploaded = true;
        $("#download_ann").attr("disabled",false);
    };

    diigoNetwork.deleteCurrentPDF = function deleteCurrentPDF(context, callback) {
        this.invoke('bm_deleteBookmark', {
            urlId: context.bookmark.server_urlId
        }, context, callback);
    };

    diigoNetwork.callback_bm_deleteBookmark_success = function callback_bm_deleteBookmark_success(data, context) {
        var bm = context.bookmark;
        bm.saved = false;
        bm.link_id = 0;

        bm.tags = [];
        bm.lists = [];
        bm.groups = [];
        bm.description = '';


        var removeIndexs = [];
        diigoUtils.each(context.diigoHighlightsData, function(a, i) {
            if (a.user == context.user && !a.onlyInGroup) {
                a.saved = false;
                removeIndexs.push(i);
            }
        });
        removeIndexs.forEach(function(index) {
            context.diigoHighlightsData.splice(index, 1);
        });

        //remove all inline comments(smasher)
        context.diigoHighlightsData.forEach(function(a) {
            removeIndexs = [];
            diigoUtils.each(a.comments, function(c, i) {
                if (c.user == context.user && !c.onlyInGroup) {
                    c.saved = false;
                    removeIndexs.push(i);
                }
            });
            if (removeIndexs.length > 0) {
                removeIndexs.forEach(function(index) {
                    a.comments.splice(index, 1);
                });
            }
        });

    };

    diigoNetwork.saveHighlightAndStickyNote = function saveHighlightAndStickyNote(ann, context, callback) {
        ann.saving = true;

        var bm = context.bookmark;

        if (ann.type == 9) {
            var data = {
                urlId: bm.server_urlId,
                id: ann.id,
                content: ann.content,
                type: ann.type,
                extra: ann.extra

            };
        }


        if (ann.type == 2) {
            var data = {
                urlId: bm.server_urlId,
                id: ann.id,
                type: ann.type,
                extra: ann.extra,

                inlineComment: {
                    annotationId: ann.id,
                    content: ann.content,
                    mode: 2
                }
            };
        }


        if (ann.comments && ann.comments.length > 0) {
            data.inlineComment = ann.comments[0];
        }
        console.log('add Highlight', bm.saved)
        if (!bm.saved) {
            var z = this;
            // try {
                diigoNetwork.pdfCreateItem({
                    mode: 2
                }, context, function(resp, ct, code) {
                    console.log('Create item successfully.');
                    data.urlId = ct.bookmark.server_urlId;
                    z.invoke('annotation_add', data, ct, callback);


                    // update buttons
                    $('#save').hide();
                    $('#edit, #download, #share').show();
                });

            // } catch (e) {
            // }
        } else {

            this.invoke('annotation_add', data, context, callback);
        }
    };

    diigoNetwork.callback_annotation_add_success = function callback_annotation_add_success(data, context) {
        //mark as saved
        if(data.inlineComment){
            this.callback_ic_add_success(data.inlineComment, context);
            return;
        }

        var anns = context.highlights.filter(function(a) {
            return a.id == data.id;
        });
        if (!anns || anns.length <= 0) return;

        var ann = anns[0];
        ann.saving = false; //clear the flag
        ann.saved = true;
        ann.onlyInGroup = data.onlyInGroup;

        //update model for groups
        if (data.groups) {
            diigoUtils.addToExistArray(ann.groups, data.groups);
        }

        if (data.__bookmark_groups) {
            diigoUtils.addToExistArray(context.bookmark.groups, data.__bookmark_groups);
        }

    };

    diigoNetwork.deleteHighlightAndStickyNote = function deleteHighlightAndStickyNote(id , context, callback) {
        var data = {};

        data.urlId = context.bookmark.server_urlId;
        data.id = id;
        this.invoke('annotation_delete', data, context, callback);
    };


    diigoNetwork.callback_annotation_delete_success = function callback_annotation_delete_success(data, context) {

    };

    diigoNetwork.updateHighlightAndStickyNote = function updateHighlightAndStickyNote(ann, context, callback) {
        var data = {
            id: ann.id,
            extra: ann.extra
        };
        this.invoke('annotation_updateExtra', data, context, callback);
    };

    diigoNetwork.callback_annotation_updateExtra_success = function callback_annotation_updateExtra_success(data, context) {

    };

    diigoNetwork.updateComment = function updateComment(ic_id, content, context, callback) {
        var data = {
            id: ic_id, //inlincoment server id
            urlId: context.bookmark.server_urlId,
            content: content
        }
        this.invoke('ic_edit', data, context, callback);
    };

    diigoNetwork.callback_ic_edit_success = function callback_ic_edit_success(data, context) {

    }

    diigoNetwork.addComment = function addComment(h_id, comment, context, callback) {
        var data = {
            annotationId: h_id,
            mode: comment.mode,
            content: comment.content,
            urlId: DiigoData.bookmark.server_urlId
        };


        this.invoke('ic_add', data, context, callback);
    };

    diigoNetwork.callback_ic_add_success = function callback_ic_add_success(data, context) {
        $.each(context.highlights.concat(context.floatnotes),function(index,ele){
            if(ele.id == data.annotationId){
                ele.comments[0].id = data.id;
                return false;
            }
        });

    };

    diigoNetwork.deleteComment = function deleteComment(ic_id, context, callback) {
        var data = {
            id: ic_id, // inline comment server id
            urlId: context.bookmark.server_urlId
        };

        this.invoke('ic_delete', data, context, callback);
    };

    diigoNetwork.callback_ic_delete_success = function callback_ic_delete_success(data, context) {

    };

    return diigoNetwork;
})();
