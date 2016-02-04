// function $(e) {
//     var E = e | document.genericfind(e);
//     return {
//	val: function() { return e.text(); }
//	prop: function(p, v) { e[p] = v; }
//	keydown: function(f) { document.on('keydown', f); }
//	inArray: function(v, a) { a.contains(v); }
//     }
// }

// NEW
// tabv <new-tab> local-storage tabv-root-bookmark tabv-today-bookmark
// tabv <new-tab> false _ = ERROR
// tabv           true  null _ = make-root; @ tabv
// tabv           true  <id> null = make-today; @ tabv
// tabv           true  <id> <id> =
//     chrome.tabs.query {}, tabs -> len tabs > MAX, tabs[MAX:].each push-tab-to-bookmark

function fileAwayDemTabs(newTab)
{

    if(localStorage.toggleState == "on") {
	if(localStorage.tabvFolderId == null) {
	    // bookmarks[{title: "Tabvention"}]
	    // |> first or make
	    // |> store-id
	    chrome.bookmarks.search({title: "Tabvention"}, make_tabv_folder);
	}

	//// ASSUME localStorage.toggleState == "on"
	//// ASSUME localStorage.tabvFolderId != null
	//// ASSUME chrome.bookmars.search({title: "Tabvention"}).length > 0

	chrome.tabs.query({}, function(tabs){
	    // f (all tabs)
	    //   len tabs < max -> ()
	    //            > max -> push excess tabs as bookmark
	    var tabCount = tabs.length;
	    var tabMax = localStorage.maxTabs;
	    var tabExcess = tabCount - tabMax;
	    if(tabCount > tabMax) {
		make_today_folder();
		for (x=0; x<tabExcess; x++) { tab_to_bookmark(tabs[x]); }
	    }
	    //chrome.bookmarks.getTree(function(bookmarks) { console.log(bookmark); });	// TODO maybe this is the culprit ?
											// pushing gigantic bookmark tree to console.buffer
	})
	//TODO: If focus/antisocial mode, close any tabs that go to social sites
	//One more thing: eventually make an update to check for YouTube, SoundCloud, Pandora, etc
	//so as to not stop da beat
    }
}

var make_tabv_folder = function(results) {
    // get-or-create "Tabvention": ensure existence of a root Tabvention bookmark folder
    // no results -> create a bookmark folder
    // store the first bookmark in localStorage
    if(results.length == 0) {
	var cb = function (folder) { localStorage.tabvFolderId = folder.id; };
	var map = {parentId : "1", title: "Tabvention" };
	chrome.bookmarks.create(map, cb);
    } else {
	localStorage.tabvFolderId = results[0].id;
    }
};

var make_today_folder = function () {
    // get-or-create bookmark folder for the day
    var now = moment().format('MMMM Do, YYYY');
    if (localStorage.dateFolderId == null
	|| localStorage.dateFolderTitle != now) {
	var F = function(currentDateFolder) {
	    localStorage.dateFolderId = currentDateFolder.id;
	    localStorage.dateFolderTitle = currentDateFolder.title;
	};
	var m = {parentId : localStorage.tabvFolderId, title: now};
	chrome.bookmarks.create(m, F);
    }
};

var tab_to_bookmark = function (tab) {
    var m = {
	parentId : localStorage.dateFolderId,
	title: tab[x].title,
	url: tab[x].url
    };
    chrome.bookmarks.create(m);
    chrome.tabs.remove(tab.id)
};

// UI

window.onload = function()
{
    if(localStorage.maxTabs !== null) {
	$("#maxTabs").val(localStorage.maxTabs);
	if(localStorage.toggleState == "on") {
	    $('#onOff').prop('checked', true);
	}
    }
    chrome.tabs.onCreated.addListener(fileAwayDemTabs);
    $("#maxTabs").keydown(function(e){
	localStorage.toggleState = null;
	$('#onOff').prop('checked', false);
	//Took this from http://stackoverflow.com/questions/469357/html-text-input-allow-only-numeric-input
	if ($.inArray(e.keyCode, [46, 8, 9, 27, 13]) !== -1 ||
	    // Allow: Ctrl+A
	    (e.keyCode == 65 && e.ctrlKey === true) ||
	    // Allow: Ctrl+C
	    (e.keyCode == 67 && e.ctrlKey === true) ||
	    // Allow: Ctrl+X
	    (e.keyCode == 88 && e.ctrlKey === true) ||
	    // Allow: home, end, left, right
	    (e.keyCode >= 35 && e.keyCode <= 39)) {
	    // let it happen, don't do anything
	    return;
	}
	// Ensure that it is a number and stop the keypress
	if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
	    e.preventDefault();
	}
    });
    $("#onOff").change(function() {
	if(this.checked) {
	    var maxTabs = $("#maxTabs").val();
	    if(maxTabs !== null && maxTabs > 0) {
		localStorage.toggleState = "on";
		localStorage.maxTabs = $("#maxTabs").val();
		fileAwayDemTabs();
	    }
	    else
	    {
		localStorage.toggleState = null;
		$('#onOff').prop('checked', false);
	    }
	}
	else
	{
	    localStorage.toggleState = null;
	}
    });
};
