// LOAD THE JSONS
var pages;
var explorables;
var tags;
window.addEventListener("load", function(){
	Q.all([
		pegasus("-data/pages.json"),
		pegasus("-data/tags.json"),
		pegasus("-data/explorables.csv")
	]).then(function(data){

		// Store Data
		pages = JSON.parse(_clean(data[0]));
		tags = JSON.parse(_clean(data[1]));
		explorables = _csvToJSON(data[2]);

		// Show page!
		_showPage(window.location.pathname);

	});
},false);

// SHOW PAGE
var _showPage = function(pageID){

	// Get page config
	pageID = pageID.replace(/\//g, ''); // strip slashes
	pageID = pageID || "index";
	var page = pages[pageID];

	// Show gallery
	var tag = (pageID=="index") ? "featured" : pageID; // tag is "featured" or pageID!
	_showGallery(page.gallery, tag);

	// Show tags
	_makeTagStyle(tags);
	setTimeout(function(){
		
		// Explorables Tags
		var explorableTags = tags.filter(function(tag){ return tag.explorable; });
		explorableTags.sort(function(a,b){
			return a.id.localeCompare(b.id); // sort alphabetically
		});
		for(var i=0; i<explorableTags.length; i++){
			$("#tags_explorables").appendChild( _makeTagButton(explorableTags[i].id) );
		}

		// Meta Tags
		var miscTags = tags.filter(function(tag){ return !tag.explorable; });
		for(var i=0; i<miscTags.length; i++){
			$("#tags_not_explorables").appendChild( _makeTagButton(miscTags[i].id) );
		}

	},1);

	// Resize everything
	setTimeout(_resize, 1);

};

// SHOW GALLERY
var _showGallery = function(query, tag){

	// Load all by tag
	var results = explorables.filter(function(e){
		return e.tags.indexOf(tag)>=0; // yes, has the tag!
	});

	// Sort the results
	switch(query.sort){
		case "random":
			_shuffle(results);
			break;
	}

	// Is this the index page? Then show 'em NICE AND BIG
	//if(query.big){
		gallery.setAttribute("big", "yes"); // Make it big
		results = results.splice(0,3); // Only show first three results
	//}

	// Insert each result into the gallery
	for(var i=0; i<results.length; i++){
		var entry = _makeGalleryEntry(results[i]);
		gallery.appendChild(entry);
	}

};

// CREATE GALLERY ENTRY
var _makeGalleryEntry = function(entry){
	
	// Whole dom is a link!
	var link = document.createElement("a");
	link.href = entry.link;
	var dom = _createDom("entry", link, "div");
	
	// Thumbnail
	var thumb = _createDom("thumb", dom, "img");
	thumb.src = "-thumbs/"+entry.thumb;
	
	// Name
	var name = _createDom("name", dom, "div");
	var isFeatured = entry.tags.indexOf("featured")>=0;
	name.innerHTML = (isFeatured?"★ ":"") + entry.name + "&nbsp;";

	// Colored tags
	for(var i=0; i<entry.tags.length; i++){
		var tag = _makeTagButton(entry.tags[i], true);
		if(tag) name.appendChild(tag);
	}

	// Description
	var description = _createDom("description", dom, "div");
	description.innerHTML = entry.description;

	// Return the DOM
	return link;

};

// CREATE TAG STYLE
var _makeTagStyle = function(tags){
	var style = document.createElement("style");
	for(var i=0; i<tags.length; i++){
		var tag = tags[i];
		style.innerHTML += ".tag_"+tag.id+"{ background:"+tag.color+" }";
	}
	document.head.appendChild(style);
};

// CREATE TAG
var _makeTagButton = function(tagID, small){
	var conf = tags.filter(function(tag){
		return tag.id==tagID;
	})[0];
	if(!conf) return null; // NO SUCH TAG, WHATEVER
	var button = document.createElement("a");
	button.href = "/"+tagID;
	button.classList.add("tag");
	button.classList.add("tag_"+tagID);
	if(small) button.setAttribute("small", "yes");
	button.innerHTML = conf.name;
	return button;
};

// Helper: remove newlines
var _clean = function(str){
	str = str.replace(/[^\:]\/\/.*\n/g,""); // strip comments
	str = str.replace(/\n|\t/g,""); // strip newlines & tabs
	return str;
};

// CSV to JSON
var _csvToJSON = function(csv){

	var results = [];

	// Get lines
	var lines = csv.split("\n");
	for(var i=1; i<lines.length; i++){ // skip first line, it's the header
		var line = lines[i];

		// Get props
		var props = line.split(",");
		for(var j=0; j<props.length; j++) props[j] = props[j].slice(1, props[j].length-1); // remove quotes

		// Convert props
		var tags = [props[4]];
		if(props[5]=="yes") tags.push("featured");

		// Add result
		results.push({
			name: props[0],
			description: props[1],
			link: props[2],
			thumb: props[3],
			tags: tags
		});

	}

	return results;

};

// RESIZE
var _resize = function(){

	// Splash title position...
	// TODO: IN CSS
	/*setTimeout(function(){
		var bounds = splash_title.getBoundingClientRect();
		var w = bounds.width;
		var h = bounds.height;
		splash_title.style.marginTop = ((330-h)/2)+"px";
	},1);*/

};
window.addEventListener("resize", _resize, false);

// SCROLL
window.onscroll = function(){
	var scrollY = window.pageYOffset;
	splash_iframe.style.top = (scrollY/2)+"px";
};