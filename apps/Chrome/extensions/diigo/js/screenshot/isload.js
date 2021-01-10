var isContentScriptLoaded; 
if(typeof isContentScriptLoaded == "undefined") {
	chrome.extension.sendRequest({action:"insert_script"});
} else {
	chrome.extension.sendRequest({action:"script_running"});
}