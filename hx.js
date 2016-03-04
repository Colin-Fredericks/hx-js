// Make sure we're only running once.
// The "if" bracket closes at end of file.
if(typeof hxjsIsRunning == 'undefined'){

    var hxjsIsRunning = true;

    $(document).ready(function() {
        console.log('Enabling HX.js');
        HXGlobalJS();
    });

}

var HXGlobalJS = (function() {


    /***********************************************/
    // Get course external URL and related info.
    // Good for logging and grabbing scripts/images.
    /***********************************************/
    
    var courseAssetURL = getAssetURL(window.location.href, 'complete');
    console.log(courseAssetURL);

    var CourseInfo = getCourseInfo(window.location.href);
    var courseLogID = CourseInfo.institution + '.' + CourseInfo.id + '_' + CourseInfo.run;
    
    console.log('course log id: ' + courseLogID);
    Logger.log('harvardx.' + courseLogID + '.globaljs', {'Global Javascript': 'loaded'});
        

    /**************************************/
    // Load outside scripts. 
    // Must be in Files & Uploads.
    // Only do it if we need them.
    /**************************************/
    
    
    var slider = $('.hx-slider');
    var navslider = $('.hx-navslider');
    var bigslider = $('.hx-bigslider');
    
    /* The "Slick" slider */
    if(slider.length || (navslider.length && bigslider.length)){
        $.getScript(courseAssetURL + 'slick.js', function(){
            console.log('Slick image slider loaded');
        });
    }
    
    
    /* Video links! As per the ones on Grape Ape. */
    var vidlinks = $('.hx-vidlinks');
    if(vidlinks.length){
        $.getScript(courseAssetURL + 'HXVideoLinks.js', function(){
            console.log('HX Video Links loaded');
            HXVideoLinks();
        });
    }



    /**************************************/
    // Stuff for a visibility toggle button.
    // Button classes start with "hx-togglebutton#"
    // Target classes start with "hx-toggletarget#"
    // # is a number. 
    /**************************************/

    $('[class^=hx-togglebutton]').on('click tap', function() {
        var myNumber = getClassNumber(this.className, 'hx-togglebutton');
        
        $('.hx-toggletarget'+myNumber).slideToggle('fast');
        
        Logger.log('harvardx.' + courseLogID + '.globaljs', {'Toggle Button': 'pressed'});
    });


    /**************************************/
    // Stuff for a highlight toggle button.
    /**************************************/

    // Set the defaults: yellow highlights that start turned off and go back to transparent afterward.
    if (typeof hxHighlightColor === 'undefined') { var hxHighlightColor = '#ff0'; }
    if (typeof hxHighlightBackground === 'undefined') { var hxHighlightBackground = 'rgba(0,0,0,0)'; }
    if (typeof hxHighlightState === 'undefined') { var hxHighlightState = true; }
    
    // Syntax: Create a button with the class "highlighter" and spans with the class "highlight"
    $( '.highlighter' ).on('click tap', function() {
        if ( hxHighlightState ) {
            $( '.highlight' ).animate( { backgroundColor: hxHighlightColor }, 200 );
        } else {
            $( '.highlight' ).animate( { backgroundColor: hxHighlightBackground }, 200 );
        }
        hxHighlightState = !hxHighlightState;
        Logger.log('harvardx.' + courseLogID + '.globaljs', {'Highlight Button': 'pressed'});
    });


    /*****************************************/
    // Stuff to make forums expand right away.
    /*****************************************/
    
    // To use, put "var hxOpenDiscussion = true" in a script tag on your page.
    if (typeof hxOpenDiscussion === 'undefined') { var hxOpenDiscussion = false; }
    if(hxOpenDiscussion){
        $(".discussion-show.control-button").click();
        Logger.log('harvardx.' + courseLogID + '.globaljs', {'Discussion': 'auto-opened'});
    }


    /*******************************************/
    // Clickable images that pop up dialog boxes.
    // Clickable area has id "MyID" and class "hx-popup-opener"
    // Target div has class "MyID hx-popup-content"
    // Don't put other classes first.
    /*******************************************/
    
    var popUpOpener = $('.hx-popup-opener');
    
    if(popUpOpener.length){
    
        // First, create lists of areas for the purpose of accessibility.
        $('map').each(function(index){
        
            // Make a list element from each area's title
            var tempList = [];
            $(this).find('area').each(function(index){
                
                tempList.push('<li class="'
                    + this.className.split(/\s+/)[0]
                    + ' hx-popup-opener" title="'
                    + this.title 
                    + '"><a href="javascript:;">' 
                    + this.title 
                    + '</a></li>'
                );
            });
            
            // Make that list into a big string and wrap it with UL
            var listHTML = '<ul>' + tempList.join('') + '</ul>';
            listHTML = '<h4>Clickable Areas:</h4>' + listHTML;
            
            // Append the list right after the map.
            $(this).after(listHTML);
        });
        
        // Get the list of popup openers again so we can bind properly.
        popUpOpener = $('.hx-popup-opener');

        // Create the dialogue if we click on the right areas or links.
        popUpOpener.on('click tap', function(){
            
            var myClass = this.className;
            var boxName = myClass.split(/\s+/)[0];
 
            $('div.'+boxName).dialog({
                dialogClass: "hx-popup-dialog",
                title: $(this).attr('title'),
                show: {
                    effect: 'fade',
                    duration: 200,
                },
                hide: {
                    effect: 'fade',
                    duration: 100,
                },
                buttons: { "Close": function() { $(this).dialog("close"); } },
            }, function(boxName){
                $('div.'+boxName).css({'display':''});
                alert(boxName);
            });
            
            Logger.log('harvardx.' + courseLogID + '.globaljs', {
                'Pop-up Dialog': 'opened',
                'Dialog': boxName
            });
        });
        
    }


    /***********************************/
    // Auto-generation of footnotes.
    // Finds <span class="hx-footnote#">[#]</span>
    // Links to <div class="hx-footnote-target#">
    // Does some rearranging and formatting.
    // Must have HTML component with h3 header "Footnotes"
    /***********************************/
    
    var allFootnotes = $('span[class^="hx-footnote"]');
    console.log(allFootnotes);
    
    if(allFootnotes.length){
        var myNumber, thisFootnote, footnoteComponents, destinationComponent;
        
        for(var i = 0; i < allFootnotes.length; i++){

            thisFootnote = allFootnotes[i];
            thisNumber = getClassNumber(thisFootnote.className, 'hx-footnote');
            thisTarget = $('div.hx-footnote-target'+thisNumber);

            // Style the footnote marker
            $(thisFootnote).addClass('hx-footnote-style');
            $(thisFootnote).wrap('<sup></sup>');

            // Move the footnote target divs to the appropriate location
            footnoteComponents = $('h3:contains("Footnote")');
            destinationComponent = $(footnoteComponents[footnoteComponents.length-1]).parent();
            $(thisTarget).detach().appendTo(destinationComponent);

            // Add links to the footnote markers
            $(thisFootnote).wrap('<a href="#hxfoot'+thisNumber+'" name="hxfootback'+thisNumber+'"></a>').wrap();

            // Add targets and back-links to the footnotes
            thisTarget.prepend('<a name="hxfoot'+thisNumber+'"></a>');
            thisTarget.append('<p><a href="#hxfootback'+thisNumber+'">(back)</a></p>');

        }
        
    }
    


    /***********************************/
    // Stuff for the Slick image slider.
    /***********************************/

    // Only do slider things if there are actually sliders to create.
    if(slider.length){
        // If there are no options set, make an options object and set the defaults.
        if (typeof hxSlickOptions === 'undefined') { var hxSlickOptions = {}; }
        hxSlickOptions = setSlickOptions(hxSlickOptions);
        
        // Wait for Slick to actually load, which can take a little while.
        var waitforSlick = setInterval(function(){
            try {
                // Add loop to handle multiple sliders.
                slider.slick(hxSlickOptions);
                clearInterval(waitforSlick);
                console.log('creating slider');
                Logger.log('harvardx.' + courseLogID + '.globaljs', {'Slick Image Slider': 'created'});
            }
            catch(err){
                console.log('waiting for Slick to load');
            }
        }, 100);
    }
    
    // This set is for matched sliders, where one is the
    // thumbnails and one is the full-sized image and/or text.
    var navslider = $('.hx-navslider');
    var bigslider = $('.hx-bigslider');
    
    if(navslider.length && bigslider.length){
        // If there are no options set, make an options object and set the defaults.
        if (typeof hxSlickNavOptions === 'undefined') { var hxSlickNavOptions = {}; }
        hxSlickNavOptions = setSlickNavOptions(hxSlickNavOptions);
        if (typeof hxSlickBigOptions === 'undefined') { var hxSlickBigOptions = {}; }
        hxSlickBigOptions = setSlickBigOptions(hxSlickBigOptions);
        
        // Add loop to handle multiple pairs.
        var waitforSlickNav = setInterval(function(){
            try {
                // Add loop to handle multiple pairs.                
                navslider.slick(hxSlickNavOptions);
                bigslider.slick(hxSlickBigOptions);
                
                clearInterval(waitforSlickNav);
                console.log('creating paired slider');
                Logger.log('harvardx.' + courseLogID + '.globaljs', {'Slick Paired Slider': 'created'});
            }
            catch(err){
                console.log('waiting for Slick to load');
            }
        }, 100);
    }

    
    //Utility functions for Slick.
    function setSlickOptions(hxSlickOptions){
        // Sets default image slider options if any of them have not been included in the HTML.
        if (typeof hxSlickOptions.arrows === 'undefined') { hxSlickOptions.arrows = true; }
        if (typeof hxSlickOptions.dots === 'undefined') { hxSlickOptions.dots = true; }
        if (typeof hxSlickOptions.infinite === 'undefined') { hxSlickOptions.infinite = true; }
        if (typeof hxSlickOptions.slidesToShow === 'undefined') { hxSlickOptions.slidesToShow = 3; }
        if (typeof hxSlickOptions.slidesToScroll === 'undefined') { hxSlickOptions.slidesToScroll = 3; }
        return hxSlickOptions;
    }

    function setSlickNavOptions(hxSlickNavOptions){
        // Sets default image slider options if any of them have not been included in the HTML.
        if (typeof hxSlickNavOptions.asNavFor === 'undefined') { hxSlickNavOptions.asNavFor = '.hx-bigslider'; }
        if (typeof hxSlickNavOptions.variableWidth === 'undefined') { hxSlickNavOptions.variableWidth = true; }
        if (typeof hxSlickNavOptions.focusOnSelect === 'undefined') { hxSlickNavOptions.focusOnSelect = true; }
        if (typeof hxSlickNavOptions.slidesToShow === 'undefined') { hxSlickNavOptions.slidesToShow = 3; }
        if (typeof hxSlickNavOptions.slidesToScroll === 'undefined') { hxSlickNavOptions.slidesToScroll = 1; }
        return hxSlickNavOptions;
    }

    function setSlickBigOptions(hxSlickBigOptions){
        // Sets default image slider options if any of them have not been included in the HTML.
        if (typeof hxSlickNavOptions.asNavFor === 'undefined') { hxSlickNavOptions.asNavFor = '.hx-navslider'; }
        if (typeof hxSlickBigOptions.arrows === 'undefined') { hxSlickBigOptions.arrows = false; }
        if (typeof hxSlickBigOptions.dots === 'undefined') { hxSlickBigOptions.dots = true; }
        if (typeof hxSlickBigOptions.fade === 'undefined') { hxSlickBigOptions.fade = true; }
        if (typeof hxSlickBigOptions.adaptiveHeight === 'undefined') { hxSlickBigOptions.adaptiveHeight = true; }
        if (typeof hxSlickBigOptions.slidesToShow === 'undefined') { hxSlickBigOptions.slidesToShow = 1; }
        if (typeof hxSlickBigOptions.slidesToScroll === 'undefined') { hxSlickBigOptions.slidesToScroll = 1; }
        return hxSlickBigOptions;
    }



    // Functions that we would like to make public. Return as function: external name
    // Nothing here right now.
    return {}

});


/***********************************/
// Various utility functions.
/***********************************/

// Turns a page URL in edX into an external asset url,
// because we can't use /static/ from within javascript.
// Pass 'complete' for the whole thing, 'site' for the site, or 'partial' for without the site.
function getAssetURL(windowURL, option){

    // Match the site in case we need it for something later.
    var courseSiteURL = windowURL.match(/https:\/\/.+.org\//)[0];
    
    if(option == 'site'){ return courseSiteURL; }

    // Switch from course to asset
    var staticFolderURL = windowURL.replace('courses/course', 'asset');

    // Ditch everything after courseware
    var finalLocation = staticFolderURL.indexOf('/courseware/');
    staticFolderURL = staticFolderURL.slice(0, finalLocation);

    // Switch from courseware to type
    staticFolderURL = staticFolderURL + '+type@asset+block/';
    
    if(option == 'partial'){ return staticFolderURL.replace(courseSiteURL, ''); }
    
    return staticFolderURL;
}

// Gets the institution, course ID, and course run from the URL.
function getCourseInfo(windowURL){
    var partialURL = getAssetURL(windowURL, 'partial');
    var courseInfo = {};
    
    // get the part from the colon to the first +
    partialURL = partialURL.split(':')[1];
    courseInfo.institution = partialURL.split('+')[0];
    courseInfo.id = partialURL.split('+')[1];
    courseInfo.run = partialURL.split('+')[2];
    
    return courseInfo;

}

// Takes in all the classes, as from a className function.
// Returns the number attached to the important class.
function getClassNumber(className, importantClass){
    var allClasses = className.split(/\s+/);
    for(var i = 0; i < allClasses.length; i++){
        if(allClasses[i].indexOf(importantClass) === 0){
            return allClasses[i].slice(importantClass.length);
        }
    }
    return -1;
}