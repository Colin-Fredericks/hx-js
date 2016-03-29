var HXGlobalJS = (function(hxLocalOptions, hxGlobalOptions, HXVideoLinks, slick) {


    /***********************************************/
    // Setting all the default options.
    // Can be overwritten in hxGlobalOptions.js
    // for course-wide defaults.
    /***********************************************/

    var hxDefaultOptions = {
        showUTCClock: false,
        hxOpenDiscussion: false,

        // Highlighter: Yellow highlights that start turned off and go back to transparent afterward.
        highlightColor: '#ff0',
        highlightBackground: 'rgba(0,0,0,0)',
        highlightState: true,

        slickOptions: {
            arrows: true,
            dots: true,
            infinite: true,
            slidesToShow: 3,
            slidesToScroll: 3
        },
        // Default options for image slider navigation
        slickNavOptions: {
            asNavFor: '.hx-bigslider',
            variableWidth: true,
            focusOnSelect: true,
            slidesToShow: 3,
            slidesToScroll: 1
        },
        // Default options for single big image slider paired to nav.
        slickBigOptions: {
            asNavFor: '.hx-navslider',
            arrows: false,
            dots: true,
            fade:  true,
            adaptiveHeight: true,
            slidesToShow: 1,
            slidesToScroll: 1
        },
    };

    /***********************************************/
    // Get course external URL and related info.
    // Good for logging and grabbing scripts/images.
    /***********************************************/
    
    var courseAssetURL = getAssetURL(window.location.href, 'complete');

    var courseInfo = getCourseInfo(window.location.href);
    var courseLogID = courseInfo.institution + '.' + courseInfo.id + '_' + courseInfo.run;
    
    logThatThing({'HX.js': 'enabled'});
    logThatThing({'course log id': courseLogID});

    if(hxGlobalOptions === {}){
        logThatThing({'Course options': 'default'});
    }else{
        logThatThing({'Course options': 'global'});
    }
    // This is the course-wide options file.
    // It overrides defaults in this file, and is overridden by local options.
    var hxOptions = setDefaultOptions(hxLocalOptions, hxGlobalOptions, hxDefaultOptions);
            
    /**************************************/
    // Links that pop up over videos.
    // Only invoking if we actually have videos.
    /**************************************/

    var allVideos = $('.video');
    var HXVL;
    if(allVideos.length){
        logThatThing({'HX Video Links': 'loaded'});
        HXVL = new HXVideoLinks();
    }

    /**************************************/
    // Jump to time in video on this page.
    // Make a link like <a href="#video1" data-time="mm:ss">link text</a>
    // The # is actually a pound sign for anchor link. 
    // Set the number to which video you want.
    /**************************************/
    
    var allTimeLinks = $('a.hx-vidtime');
    allTimeLinks.on('click tap', function(){
        var thisTime = HXVL.hmsToTime($(this).attr('data-time'));
        var vidNumber = $(this).attr('href').replace('#video', '');
        HXVL.jumpToTime(vidNumber, thisTime);
        logThatThing({'link starts video at time': thisTime});
    });

    // Placeholder: Intro.js walkthroughs


    // Placeholder: Pop-up assessments

    // Placeholder: TOC maker


    // UTC Clock (currently an iframe from TimeAndDate.com)
    if(hxOptions.showUTCClock){
        var hxClockFrame = '<li style="float:right;"><iframe src="https://freesecure.timeanddate.com/clock/i53t5o51/fc5e5e5e/tct/pct/ftb/ts1/ta1" title="UTC Clock" frameborder="0" width="100" height="16" style="padding-left: 11px; padding-top: 11px;"></iframe></div>';
        var hxClockSpot = $('.course-tabs');
        hxClockSpot.append(hxClockFrame);
    }


    // Placeholder: Audio player


    /**************************************/
    // Stuff for a visibility toggle button.
    // Button classes start with "hx-togglebutton#"
    // Target classes start with "hx-toggletarget#"
    // # is a number, not a pound sign. 
    /**************************************/

    $('[class^=hx-togglebutton]').on('click tap', function() {
    
        var myNumber = getClassNumber(this.className, 'hx-togglebutton');
    
        $('.hx-toggletarget'+myNumber).slideToggle('fast');
    
        logThatThing({
            'Toggle button': 'pressed',
            'Toggle number': myNumber
        });
    });


    /**************************************/
    // Stuff for a highlight toggle button.
    /**************************************/

    // Syntax: Create a button with the class "highlighter" and spans with the class "highlight"
    $( '[class^=hx-highlighter]').on('click tap', function() {
    
        var myNumber = getClassNumber(this.className, 'hx-highlighter');
        
        if ( hxOptions.highlightState ) {
            $( '.hx-highlight'+myNumber ).animate( { backgroundColor: hxOptions.highlightColor }, 200 );
        } else {
            $( '.hx-highlight'+myNumber ).animate( { backgroundColor: hxOptions.highlightBackground }, 200 );
        }
        
        hxOptions.highlightState = !hxOptions.highlightState;
    
        logThatThing({
            'Highlight button': 'pressed',
            'Highlight number': myNumber
        });
    });


    /*****************************************/
    // Stuff to make forums expand right away.
    /*****************************************/

    // To use, put "var hxOpenDiscussion = true" in a script tag on your page.

    if(hxOptions.hxOpenDiscussion){
        $(".discussion-show.control-button").click();
        logThatThing({'Discussion': 'auto-opened'});
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
        
            logThatThing({
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

    if(allFootnotes.length){
        var thisFootnote, thisNumber, thisTarget, footnoteComponents, destinationComponent;
    
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

    var slider = $('.hx-slider');
    var navslider = $('.hx-navslider');
    var bigslider = $('.hx-bigslider');

    // Only do slider things if there are actually sliders to create.
    if(slider.length){

        logThatThing({'slider': 'found'});

        // Wait for Slick to actually load, which can take a little while.
        var waitForSlick = setInterval(function(){
            try {
                // In future, add loop to handle multiple sliders.
                slider.slick(hxOptions.slickOptions);
                clearInterval(waitForSlick);
                logThatThing({'slider': 'created'});
            }
            catch(err){
                logThatThing({'slider': 'waiting for Slick to load'});
            }
        }, 200);
    }


    // This set is for matched sliders, where one is the
    // thumbnails and one is the full-sized image and/or text.
    if(navslider.length && bigslider.length){

        logThatThing({'paired slider': 'found'});
    
        var waitForSlickNav = setInterval(function(){
            try {
                // In future, add loop to handle multiple pairs.         
                navslider.slick(hxOptions.slickNavOptions);
                bigslider.slick(hxOptions.slickBigOptions);
            
                clearInterval(waitForSlickNav);
                logThatThing({'paired slider': 'created'});
            }
            catch(err){
                logThatThing({'paired slider': 'waiting for Slick to load'});
            }
        }, 200);
    }
    

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
    
    // Sets the default options for something if they're not already defined.
    // Prioritizes local options, then global options in /static/, then the ones in this file.
    // Does deep copy (clone)
    function setDefaultOptions(localOptions, globalOptions, fallbackOptions){

        var tempOptions = {};
        
        if (!localOptions && !globalOptions) {
            return fallbackOptions;
        } else if (!localOptions) {
            tempOptions = $.extend(true, {}, fallbackOptions, globalOptions);
        } else if (!globalOptions) {
            tempOptions = $.extend(true, {}, fallbackOptions, localOptions);
        } else {
            tempOptions = $.extend(true, {}, fallbackOptions, globalOptions, localOptions);
        }
        
        return tempOptions;
    }
    
    // Konami Code
    (function($) {

        $.fn.hxKonami = function(callback, code) {
            if(code === undefined) code = "38,38,40,40,37,39,37,39,66,65";
        
            return this.each(function() {
                var kkeys = [];
                $(this).keydown(function(e){
                    kkeys.push( e.keyCode );
                    while (kkeys.length > code.split(',').length) {
                        kkeys.shift();
                    }
                    if ( kkeys.toString().indexOf( code ) >= 0 ){
                        kkeys = [];
                        callback(e);
                    }
                });
            });
        };

    })(jQuery);
    
    // Should probably add code to make sure this doesn't get run multiple times.
    $(window).hxKonami(function(){
        alert('+30 Lives');
        logThatThing({'easter egg': 'Konami Code'});
    });


    // Send logs both to the console and to the official edX logamajig.
    function logThatThing(ThatThing){
        console.log(JSON.stringify(ThatThing));
        Logger.log(courseLogID + '.hxjs', ThatThing);
    }

});


// Make sure we're only running once.
if(typeof hxjsIsRunning === 'undefined'){

    var hxjsIsRunning = true;

    // Check for local options object.
    if (typeof hxLocalOptions === 'undefined') { var hxLocalOptions = {}; }

    $(document).ready(function(hxLocalOptions) {
        HXGlobalJS(hxLocalOptions);
        requirejs(['hxGlobalOptions', 'HXVideoLinks', 'slick'],
            HXGlobalJS(hxLocalOptions, hxGlobalOptions, HXVideoLinks, slick),
            function(err){
                var failedId = err.requireModules && err.requireModules[0];
                if (failedId === 'hxGlobalOptions') {
                    HXGlobalJS(hxLocalOptions, {}, HXVideoLinks, slick),
                }
            }
        );
    });

}

