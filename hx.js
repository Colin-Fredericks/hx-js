var HXGlobalJS = (function(hxLocalOptions, HXPUPTimer) {


    /***********************************************/
    // Setting all the default options.
    // Can be overwritten in hxGlobalOptions.js
    // for course-wide defaults.
    /***********************************************/

    var hxDefaultOptions = {
        // Table of Contents
        makeTOC: false,

        // Remove a lot of the navigation "chrome" - use only if you have just one page per unit.
        collapsedNav: false,

        // Click to turn frowny things smiley?
        makeSmiles: true,

        // Auto-open the on-page discussions.
        openPageDiscussion: false,

        // Resize image maps when an image shrinks because of screen size
        resizeMaps: true,

        // Marks all external links with an icon.
        markExternalLinks: false,

        // Highlighter: Yellow highlights that start turned off and go back to transparent afterward.
        highlightColor: '#ff0',
        highlightBackground: 'rgba(0,0,0,0)',
        highlightState: true,
        // Code syntax highlighting
        highlightCode: true,

        // Default options for Slick image slider
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
            fade: true,
            adaptiveHeight: true,
            slidesToShow: 1,
            slidesToScroll: 1
        },
        // Default options for text slider
        textSliderOptions: {
            slidesFile: 'TextSliderCards.csv',
            startingSlide: '',
            // Add slide IDs to this list to include them, or remove the whole thing to include everything.
            slideScope: [],
            overviewIsOpen: false,
            showBottomNav: true
        },
        // Default options for pop-up problems
        PUPOptions: {
            width: 800,
            effect: 'fade',
            effectlength: 200,
            myPosition: 'center',
            atPosition: 'center',
            ofTarget: window
        },
        // Default options for video links
        VidLinkOptions: {
            hideLinkAfter: 5, //seconds
            effect: 'slide',
            hide: {'direction':'down'},
            show: {'direction':'down'},
            speed: 500,
            location: 'bl'  // Bottom Left. bl, br, tl, and tr are all ok.
        }
    };

    /***********************************************/
    // Get course external URL and related info.
    // Good for logging and grabbing scripts/images.
    /***********************************************/

    var courseAssetURL = getAssetURL(window.location.href, 'complete');
    logThatThing(courseAssetURL);

    // Are we in Studio? If so, stop trying to run anything. Just quit.
    var courseSite = getAssetURL(window.location.href, 'site');
    if (courseSite.indexOf('studio') > -1){
        console.log('Running HXJS in studio is probably not great. Quitting.');
        return;
    }

    // Get our current location, mostly for logging purposes,
    // but also so we can load the scripts properly.
    var courseInfo = getCourseInfo(window.location.href);
    var courseLogID = courseInfo.institution + '.' + courseInfo.id + '_' + courseInfo.run;

    logThatThing({'HX.js': 'enabled'});
    logThatThing({'course log id': courseLogID});


    /**************************************/
    // Load outside scripts.
    // Must be in Files & Uploads.
    // Only do it if we need them.
    // Continue when done.
    /**************************************/

    // Define the function that gets the outside scripts.
    $.getMultiScripts = function(arr, path) {
        var _arr = $.map(arr, function(scr) {
            return $.getScript( (path||'') + scr );
        });

        _arr.push($.Deferred(function( deferred ){
            $( deferred.resolve );
        }));

        return $.when.apply($, _arr);
    };

    var scriptArray = [];

    // We definitely want to load the course-wide options file.
    // It overrides defaults in this file, and is overridden by local options.
    var hxOptions = {};
    scriptArray.push('hxGlobalOptions.js');

    // Do we load Prism for code highlighting?
    var codeblocks = $('code');
    if(codeblocks.length){
        logThatThing({'code_block': 'found'});
          scriptArray.push('prism.js');
    }

    // Do we load Slick for image sliders?
    var slider = $('.hx-slider');
    var navslider = $('.hx-navslider');
    var bigslider = $('.hx-bigslider');
    if(slider.length || (navslider.length && bigslider.length)){
        logThatThing({'image_slider': 'found'});
        scriptArray.push('slick.js');
    }

    // Do we load the Image Map Resizer?
    var theMaps = $('map');
    if(theMaps.length){
        logThatThing({'image_map': 'found'});
        scriptArray.push('imageMapResizer.min.js');
    }

    // Do we load HXVideoLinks for... um... HarvardX video links?
    // And HXPopUpProblems for pop-up problems.
    // Set hxLocalOptions.dontLoadVideoStuff: true to avoid this,
    // for instance if you have several videos on one page that don't need it.
    var loadVideoStuff = true;
    if(typeof hxLocalOptions.dontLoadVideoStuff !== undefined){
        if(hxLocalOptions.dontLoadVideoStuff === true){
            loadVideoStuff = false;
            console.log('skipping loading video js');
        }
    }

    // We load the video scripts when...
    // - we're not specifically told not to
    // - and there's a video on the page
    // - and, for pop-up problems, there needs to be a timer.
    var allVideos = $('.video');
    if(loadVideoStuff){
        if(allVideos.length){
            logThatThing({'video': 'found'});
            scriptArray.push('HXVideoLinks.js');
            var HXVL;
            // Only do pop-up problems if there's a timer in place.
            if(HXPUPTimer.length !== 0){
                scriptArray.push('HXPopUpProblems.js');
                var HXPUP;
            }
        }
    }

    // This is where we load all the outside scripts we want.
    $.getMultiScripts(scriptArray, courseAssetURL)
        .done(function() {
            logThatThing({'Loaded scripts': scriptArray});
            if(hxGlobalOptions){
                hxOptions = setDefaultOptions(hxLocalOptions, hxGlobalOptions, hxDefaultOptions);
            }else{
                hxOptions = setDefaultOptions(hxLocalOptions, {}, hxDefaultOptions);
            }
            keepGoing(hxOptions);
        }).fail(function(){
            logThatThing('Did not load scripts.');
            hxOptions = setDefaultOptions(hxLocalOptions, {}, hxDefaultOptions);
            keepGoing(hxOptions);
    });

    // Once we have the options, we're ready to proceed.
    function keepGoing(hxOptions){

        /**************************************/
        // If we have videos, instantiate the functions
        // that handle pop-up links and problems.
        /**************************************/
        if(allVideos.length && loadVideoStuff){
            $('head').append($('<link rel="stylesheet" href="' + courseAssetURL + 'VideoLinks.css" type="text/css" />'));
            HXVL = new HXVideoLinks(hxOptions.VidLinkOptions);

            // Only do pop-up problems if there's a timer in place.
            if(HXPUPTimer.length !== 0){
                HXPUP = new HXPopUpProblems(hxDefaultOptions.PUPOptions, HXPUPTimer);
            }
        }

        /**************************************/
        // If we have image maps, scale them.
        /**************************************/
        if(theMaps.length && hxOptions.resizeMaps){
            $('map').imageMapResize();
        }


        /**************************************/
        /* If we have code blocks on the page,
        /* load the style sheet for them, and
        /* make sure they recolor properly later.
        /**************************************/
        if( codeblocks.length && hxOptions.highlightCode){
          $('head').append($('<link rel="stylesheet" href="' + courseAssetURL + 'prism.css" type="text/css" />'));

          // If a student submits or resets a problem, we'll need to recolor the code.
          $('.submit, .reset').on('click tap', function(){
            // Recoloring function. Needs to remove observer temporarily,
            // or its brain will explode with all the mutations.
            var rehighlight = function(mutationsList) {
              for(var mutation of mutationsList) {
                if (mutation.type == 'childList') {
                  $.when( observer.disconnect() ).done(function(){
                    $.when(Prism.highlightAllUnder(target)).done(function(){
                      // Submitting or resetting results in a lot of changes.
                      // Just wait half a second for them to go through.
                      // It'll save us a lot of overhead.
                      setTimeout(function(){
                        observer.observe(target, config);
                      }, 500);
                    });
                  });
                  break;
                }
              }
            }

            // After learners submit, watch the problem for mutations.
            // Once the mutations happen, recolor the code in that problem.
            var target = this.closest('.xblock');
            var config = {childList: true};
            var observer = new MutationObserver(rehighlight);
            observer.observe(target, config);
          });
        }



        /**************************************/
        // Jump to time in video on this page.
        // Make a link like <a href="#video1" data-time="mm:ss">link text</a>
        // The # is actually a pound sign for anchor link.
        // Set the number to which video you want. Top one is 1.
        /**************************************/

        var allTimeLinks = $('a.hx-vidtime');
        allTimeLinks.on('click tap', function(){
            var thisTime = hmsToTime($(this).attr('data-time'));
            var href = $(this).attr('href');
            var anchor = href.slice(href.indexOf('#video'));
            var vidNumber = anchor.replace('#video', '');
            var unitNumber = href.slice(href.indexOf('/jump_to_id/') + 13, href.indexOf('#video'));
            var startsWithHash = href.indexOf('#') === 0 ? true : false;

            // If the href starts with a pound sign, go on this page.
            if(startsWithHash){
                logThatThing({'link starts video at time': thisTime});
                HXVL.jumpToTime(vidNumber, thisTime);
            }
            // If not, stash the destination in HTML5 Local Storage
            // so that we can retrieve it on the next page.
            else{
                localStorage.HXVideoLinkGo = "true";
                localStorage.HXVideoLinkUnit = unitNumber;
                localStorage.HXVideoLinkNumber = vidNumber;
                localStorage.HXVideoLinkTime = thisTime;
                logThatThing({'storing video info for jump': {
                    'unit': unitNumber,
                    'video number': vidNumber,
                    'time':thisTime
                    }
                });
            }
        });


        /**************************************/
        // Collapsed Navigation
        // Removes the navigation bar at the top of the page.
        // The arrows will still be at the bottom of the page.
        // Set hxLocalOptions.collapsedNav = true to use, or pref. in Global
        /**************************************/
        if(hxOptions.collapsedNav){
            $('.sequence-nav').hide();
            // $('.sequence-bottom').hide();
            $('.sequence > .path').hide();
            $('h3.unit-title').hide();
        }

        /**************************************/
        // Make Smiles
        // Adds a little meh-face at the bottom of the page.
        // Click on it to make it smiley.
        // Might eventually store state in LocalStorage.
        /**************************************/
        if(hxOptions.makeSmiles){

            // var smileLocation = $('.sequence-nav .nav-item.active').attr('data-id');
            var mehFace = $('<span class="hx-smileystack hx-meh fa-stack fa-lg"><span class="fa fa-circle fa-stack-2x"></span><span class="fa fa-meh-o fa-stack-2x"></span></span>');
            var smileFace = $('<span class="hx-smileystack hx-smile fa-stack fa-lg"><span class="fa fa-circle fa-stack-2x"></span><span class="fa fa-smile-o fa-stack-2x"></span></span>');
            var spacer = $('<span class="hx-smileyspacer"></span>');
            // Remove any existing elements, because the way edX loads pages calls javascript multiple times
            $('.hx-smileystack').remove();
            $('.hx-smileyspacer').remove();
            $('.sequence-bottom').prepend(spacer);
            $('.sequence-bottom').append(mehFace);
            $(mehFace).on('click tap', function(){
                $(mehFace).remove();
                $('.sequence-bottom').append(smileFace);
                logThatThing('Smile!');
            });
        }

        /**************************************/
        // Make a color picker that lightly tints the page
        // for people with dyslexia.
        // Still a work in progress.
        /**************************************/
        var tintButton = $('#hx-tint');
        if(tintButton.length){
            $(tintButton).on('click tap', function(){
                $('p').animate({'color': 'blue'});
            });
        }

        /**************************************/
        // Forum Tricks section. Right now, we only have:
        // Auto-open inline discussions
        /**************************************/
        if(hxOptions.openPageDiscussion){
            $('.discussion-show.btn').click();
        }


        /**************************************/
        // External Links
        // Adds a FontAwesome icon for external links at the end of
        // each link that does not lead to an edx course.
        // Set hxLocalOptions.markExternalLinks = true to use.
        /**************************************/
        if(hxOptions.markExternalLinks){
            logThatThing('marking external links');
            $('.vert .xblock a, .static_tab_wrapper .xblock a').each(function(i, linky){
                var destination = $(linky).attr('href');
                if(typeof destination !== 'undefined'){
                    if( destination.includes('edx.org')
                        || destination.includes('mailto')
                        || destination.includes('jump_to_id')
                        || destination.includes('/courses/')
                        || destination.includes('cloudfront.net')
                        || destination.includes('edx-cdn.org')
                        || destination.includes('edxapp')
                        || destination.includes('javascript:void')
                        || destination.slice(0,1) == '#' ){

                    }else{
                        $(linky).append(' <span class="fa fa-external-link"><span class="sr">External link</span></span>');
                    }
                }
            });
        }


        /**************************************/
        // Automatic Table of Contents maker.
        // Uses h3 and h4 elements, links them up.
        // Set hxLocalOptions.makeTOC = true to use.
        /**************************************/

        if(hxOptions.makeTOC){
            if($('.edx-notes-wrapper-content').length){
                $('.edx-notes-wrapper-content:first-of-type').prepend('<div id="autoTOC" class="hx-autotoc"></div>');
            }else{
                $('#seq_content .xblock:first-of-type').prepend('<div id="autoTOC" class="hx-autotoc"></div>');
            }
            // Using text instead of objects to make nesting easier.
            var autoTOC = '<h3>Table of Contents</h3><ul>';

            // Get all the h3 and h4 elements on the page.
            var allHeaders = $('h3, h4').filter(function() {
                // Remove anything that's hidden away.
                return $(this).is(':visible');
            });

            var TOCList = $('#autoTOC ul');

            // For each header, add it to the list and make a link.
            allHeaders.each(function(i){
                // Set the id of the element to link to.
                $(this).attr('id','TOCLink'+i);

                var TOCEntry = $(this).text();
                var TOCLevel;
                if($(this).is('h3')){
                    TOCLevel = 3;
                    if($(allHeaders[i-1]).is('h3') || i===0){
                        autoTOC += '<li class="autotoc'
                            + TOCLevel
                            + '"><a href="#TOCLink'+i+'">'
                            + TOCEntry
                            + '</a></li>';
                    } else if($(allHeaders[i-1]).is('h4')){
                        autoTOC += '</ul></li><li class="autotoc'
                            + TOCLevel
                            + '"><a href="#TOCLink'+i+'">'
                            + TOCEntry
                            + '</a></li>';
                    }
                }
                if($(this).is('h4')){
                    TOCLevel = 4;
                    if($(allHeaders[i-1]).is('h3')){
                        if(i>0){ autoTOC.slice(0, autoTOC.length - 5); }
                        autoTOC += '<ul><li class="autotoc'
                            + TOCLevel
                            + '"><a href="#TOCLink'+i+'">'
                            + TOCEntry
                            + '</a></li>';
                    } else if($(allHeaders[i-1]).is('h4')){
                        autoTOC += '<li class="autotoc'
                            + TOCLevel
                            + '"><a href="#TOCLink'+i+'">'
                            + TOCEntry
                            + '</a></li>';
                    }
                }
            });
            autoTOC += '</ul>';

            // Done - add it all to the DOM.
            $('#autoTOC').append(autoTOC);
        }


        /**************************************/
        // Stuff for a visibility toggle button.
        // Button classes start with "hx-togglebutton#"
        // Target classes start with "hx-toggletarget#"
        // # is a number, not a pound sign.
        /**************************************/

        $('[class^=hx-togglebutton]').each(function(){
            var myNumber = getClassNumber(this.className, 'hx-togglebutton');
            $(this).attr('aria-controls' , 'hx-toggletarget'+myNumber);

            if( $('.hx-toggletarget'+myNumber+':visible').length > 0 ){
                $(this).attr('aria-expanded','true');
                $('.hx-toggletarget'+myNumber).attr('aria-hidden','false');
            }else{
                $(this).attr('aria-expanded','false');
                $('[class^=hx-toggletarget]').attr('aria-hidden','true');
            }
        });

        $('[class^=hx-togglebutton]').on('click tap', function() {

            var myNumber = getClassNumber(this.className, 'hx-togglebutton');

            $('.hx-toggletarget'+myNumber).slideToggle('fast');

            if( $(this).attr('aria-expanded') === 'true'){
                logThatThing({
                    'Toggle button': 'pressed',
                    'Toggled to': 'invisible',
                    'Toggle number': myNumber
                });
                $(this).attr('aria-expanded','false');
                $('.hx-toggletarget'+myNumber).attr('aria-hidden','true');
            }else{
                logThatThing({
                    'Toggle button': 'pressed',
                    'Toggled to': 'visible',
                    'Toggle number': myNumber
                });
                $(this).attr('aria-expanded','true');
                $('.hx-toggletarget'+myNumber).attr('aria-hidden','false');
            }

        });


        /**************************************/
        // Highlight toggle button.
        // Create a button with the class "highlighter#"
        // and spans with the class "highlight#"
        // where the # is a number.
        /**************************************/

        $('[class^=hx-highlighter]').on('click tap', function() {

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


        /*******************************************/
        // Clickable images that pop up dialog boxes.
        // Clickable area has id "MyID" and class "hx-popup-opener"
        // Target div has class "MyID hx-popup-content"
        // Don't put other classes first, but you can put them later if you want.
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

        // Only do slider things if there are actually sliders to create.
        // Would be good to handle multiple sliders later on.
        if(slider.length){
            $('head').append($('<link rel="stylesheet" href="' + courseAssetURL + 'slick.css" type="text/css" />'));
            $('head').append($('<link rel="stylesheet" href="' + courseAssetURL + 'slick-theme.css" type="text/css" />'));
            slider.slick(hxOptions.slickOptions);
            logThatThing({'slider': 'created'});
        }

        // This set is for matched sliders, where one is the
        // thumbnails and one is the full-sized image and/or text.
        // Would be good to handle multiple pairs later on.
        if(navslider.length && bigslider.length){
            navslider.slick(hxOptions.slickNavOptions);
            bigslider.slick(hxOptions.slickBigOptions);
            logThatThing({'paired slider': 'created'});
        }


        // Placeholder: Audio player

        // Placeholder: Intro.js walkthroughs
        // Still trying to figure out how to place these properly.

    }


    /***********************************/
    // Various utility functions.
    /***********************************/

    // Turns a page URL in edX into an external asset url,
    // because we can't use /static/ from within javascript.
    // Pass 'complete' for the whole thing, 'site' for the site, or 'partial' for without the site.
    // Public function.
    function getAssetURL(windowURL, option){

        // Sometimes escape characters are not our friends.
        windowURL = windowURL.replace('%2B', '+');
        windowURL = windowURL.replace('%3A', ':');

        // Match the site in case we need it for something later.
        var courseSiteURL = windowURL.match(/https:\/\/.+\//)[0];

        if(option == 'site'){ return courseSiteURL; }

        // Switch from course to asset
        var staticFolderURL = windowURL.replace('courses/course', 'asset');

        // In case we're rendering in XBlock URL mode:
        if(staticFolderURL.search('xblock/block-v1') > -1){
            staticFolderURL = staticFolderURL.replace('xblock/block', 'asset');
            staticFolderURL = staticFolderURL.replace('+type@', '/');
        }

        // Ditch the unique identifier for this resource.
        var pluslocation = staticFolderURL.indexOf('+');
        var finalLocation = staticFolderURL.indexOf('/', pluslocation);
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
        partialURL = partialURL.split(':')[2];
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


    // Converts hh:mm:ss to a number of seconds for time-based problems.
    // If it's passed a number, it just spits that back out as seconds.
    // Public function.
    function hmsToTime(hms){

        hms = hms.toString();

        var hmsArray = hms.split(':');
        var time = 0;

        if(hmsArray.length == 3){
            time = 3600*parseInt(hmsArray[0]) + 60*parseInt(hmsArray[1]) + Number(hmsArray[2]);
        }
        else if(hmsArray.length == 2){
            time = 60*parseInt(hmsArray[0]) + Number(hmsArray[1]);
        }

        else if(hmsArray.length == 1){
            time = Number(hmsArray[0]);
        }

        return time;
    }

    this.getAssetURL = getAssetURL;
    this.hmsToTime = hmsToTime;


    // Send logs both to the console and to the official edX logamajig.
    function logThatThing(ThatThing){
        console.log(JSON.stringify(ThatThing));
        Logger.log(courseLogID + '.hxjs', ThatThing);
    }

    this.logThatThing = logThatThing;

});


// Check for local options object.
if (typeof hxLocalOptions === 'undefined') { var hxLocalOptions = {}; }

// Check for local timers for pop-up problems.
if (typeof HXPUPTimer === 'undefined') { var HXPUPTimer = []; }

$(document).ready(function() {
    HXGlobalJS(hxLocalOptions, HXPUPTimer);
});
