/*************************************************************
/ Text slider for use within edX
/ Dynamically loads a CSV file to create interactive slides.
/ Created at HarvardX
/ Requirements:
/  * Slick image slider https://kenwheeler.github.io/slick/
/  * PapaParse csv parser https://github.com/mholt/PapaParse
/  * HX-JS, which provides Slick and utility functions
/           https://github.com/Colin-Fredericks/hx-js
/ Last update: 11 September 2018
*************************************************************/

var HXTextSlider = (function(options) {

    var history = [];
    var breadcrumbs = [];
    var backButton = $('.slick-current.backToParentSlide');
    var homeSlideButton = $('.slick-current.goToHomeSlide');
    var showOverviewButton = $('.slick-current.showOverview');
    var HXslider = $('.hx-slider');
    var slideData = [];
    var iconsize = 65; //pixels
    var staticFolder = getAssetURL(window.location.href, 'complete');

    var colorLookup = {
        'red': '#c00000',
        'yellow': '#FFC001',
        'green': '#00B050',
        'cyan': '#4adec4',
        'blue': '#475292',
        'grey': '#6e6e6e',
        'gray': '#6e6e6e'
    };

    function hexToRGB(hex){
        var c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+')';
        }
        throw new Error('Bad Hex');
    }

    // Process flat data into more useful structure. Particularly,
    // get icons as array instead of a bunch of separate entries.
    function makeSlideArray(sd){
        // Valid keys: Icon#, Icon#Target	Icon#Alt
        let newSlideData = [];

        sd.forEach(function(e){
            let newElement = {};
            newElement.icons=[];
            newElement.folds=[];
            Object.keys(e).forEach( function(key){
                let lowerkey = key.toLowerCase();
                newElement[lowerkey] = e[key];
                newElement.inScope = false;

                // Make arrays for headers and folded texts
                if(key.indexOf('Fold') === 0){
                    // Last character is the number, no more than 9.
                    let foldNum = parseInt(key[key.length-1]) - 1;
                    if( typeof newElement.folds[foldNum] === 'undefined' ){
                        newElement.folds[foldNum] = {};
                    }
                    if( key == 'FoldHeader' + (foldNum + 1) ){
                        newElement.folds[foldNum].header = e[key];
                    }else if( key == 'FoldText' + (foldNum + 1) ){
                        newElement.folds[foldNum].text = e[key];
                    }else{
                        console.log('Weird key detected: ' + key);
                    }
                }

                // Make arrays for icons
                if(key.indexOf('Icon') === 0){
                    // Last character is always the number,
                    // and we don't allow more than 9 icons.
                    let iconNum = parseInt(key[key.length-1]) - 1;
                    if( typeof newElement.icons[iconNum] === 'undefined' ){
                        newElement.icons[iconNum] = {};
                    }
                    if( key == 'Icon' + (iconNum + 1) ){
                        newElement.icons[iconNum].image = e[key];
                    }else if( key == 'IconTarget' + (iconNum + 1) ){
                        newElement.icons[iconNum].target = e[key];
                    }else if( key == 'IconAlt' + (iconNum + 1) ){
                        newElement.icons[iconNum].alt = e[key];
                    }else{
                        console.log('Weird key detected: ' + key);
                    }
                }
            });
            newSlideData.push(newElement);
        });

        // Check to make sure the slideScope fits this set of slides.
        if(options.slideScope.length !== 0){
            for(let i=0; i < options.slideScope.length; i++){
                let scopeInSlides = false;
                for(let j=0; j< newSlideData.length; j++){
                    if(options.slideScope[i] == newSlideData[j].id){
                        scopeInSlides = true;
                        newSlideData[j].inScope = true;
                        break;
                    }
                }
                if(!scopeInSlides){
                    console.log(options.slideScope[i] + ' is in scope but not in the current slide list.');
                }
            }
        }else{
            console.log('No scoping for these slides.');
            newSlideData.forEach( function(s){ s.inScope = true; } );
        }

        return newSlideData;
    }

    // Returns the div for the current slide.
    function currentSlide(){
        let cs = $($('.slick-current')[0]);
        return cs;
    }

    // Returns the object for the slide with id slideName
    function lookupSlide(slideName){
        for(let i = 0; i < slideData.length; i++){
            if(slideData[i].id == slideName){
                return slideData[i];
            }
        }
        console.log('Cannot find slide whose id matches the link\'s target: ' + slideName);
    }

    // Takes a slide object and returns the HTML for it.
    function getSlideHTML(slide){

        let slideHTML = '';

        // Breadcrumbs
        slideHTML += '<div data-breadcrumb="' + slide.breadcrumb +
            '" data-slide-id="' + slide.id +
            '" tabindex="-1">';

        // Icon and title
        slideHTML += '<img class="hx-slide-icon" alt="" ' +
            'width="' + iconsize + 'px"' +
            'src="' + staticFolder + slide.ownicon + '"/>';
        slideHTML += '<h3 class="hx-slide-title" style="border-bottom: 2px solid ' +
            colorLookup[slide.category] +
            ';">' + slide.title + '</h3><br clear="all"/>';

        slideHTML += '<div class="hx-slidelayout">';

        // Left part, with text
        slideHTML += '<div class="hx-leftbox">';
        slideHTML += slide.abovefold;

        // All the collapsible bits, if any.
        for(let j = 0; j < slide.folds.length; j++){
            if(slide.folds[j].header !== ''){
                slideHTML += '<h4 class="hx-togglenext" tabindex="0" ' +
                    'aria-expanded="false" aria-controls="hx-folded-' + j + '">';
                slideHTML += '<span class="fa fa-caret-right"></span> ';
                slideHTML += slide.folds[j].header;
                slideHTML += ' <span class="sr hx-expandnote">Click to expand</span></h4>';
                slideHTML += '<div id="hx-folded-' + j + '" aria-hidden="true">' +
                    slide.folds[j].text + '</div>';
            }
        }
        slideHTML += '</div>';

        // Right part, with optional figure
        slideHTML += '<div class="hx-rightbox">';

        if(slide.image){
            slideHTML += '<figure>';
            slideHTML += '<a href="' + slide.image + '" target="_blank">';
            slideHTML += '<img src="' + slide.image + '" alt="' + slide.alt + '" />';
            slideHTML += '</a>';
            slideHTML += '<figcaption>' + slide.caption + '</figcaption>';
            slideHTML += '</figure>';
        }

        slideHTML += '</div>';

        slideHTML += '</div>';

        slideHTML += getControlBoxHTML();

        // Hidden navigation drawer right below the breadcrumbs.
        slideHTML += getOverviewHTML(slide)[0].outerHTML;

        return slideHTML;
    }

    // This is the container for the back, home, and hide/show buttons.
    function getControlBoxHTML(){
        let controlHTML = $('<div/>');
        controlHTML.addClass('controlbox');

        let backButton = $('<button/>');
        backButton.addClass('overviewNavControl backToParentSlide inactiveControl');
        backButton.append('<span class="fa fa-arrow-circle-left"><span class="sr">Previous Topic</span></span>');
        controlHTML.append(backButton);

        let homeButton = $('<button/>');
        homeButton.addClass('overviewNavControl goToHomeSlide inactiveControl');
        homeButton.append('<span class="fa fa-home"><span class="sr">Home Slide</span></span>');
        controlHTML.append(homeButton);

        let overviewButton = $('<button/>');
        overviewButton.addClass('showOverview');
        overviewButton.append('<span class="fa fa-chevron-right"></span>');
        overviewButton.append('<span class="showOverviewNote"> Show Overview</span>');

        controlHTML.append(overviewButton);

        return controlHTML[0].outerHTML;
    }


    // Takes a slide object and returns the HTML for the local overview.
    function getOverviewHTML(slide){

        let overview = $('<div/>');
        overview.addClass('hxslide-overview-bigbox hxslide-overview-master');
        if(!options.overviewIsOpen){
            overview.css('display','none');
        }

        // Add a column for each category (color) in the spreadsheet.
        let allCategories = slideData.map(x => x.category);
        let cats = [... new Set(allCategories)];
        cats.forEach(function(cat, i){

            // Create a column
            let column = $('<div/>');
            column.addClass('hxslide-overview-container');

            // Insert the category indicator
            // Unless there's only one category.
            if(cats.length > 1){
                let indicator = $('<div/>');
                indicator.addClass('hxslide-column-indicator' + ' indicator-bar-' + cat);
                indicator.css('background-color',colorLookup[cat]);
                indicator.text(options.categoryTitles[cat]);
                column.append(indicator);
            }

            // Indicate the active category
            // Unless there's only one category. Then just put in the spacer.
            if(slide.category === cat && cats.length > 1){
                let svgIndicator = $('<svg viewBox="0 0 100 30" width="100%" height="30px" preserveAspectRatio="none"></svg>');
                svgIndicator.append('<polygon points="0,0 50,30 100,0" style="fill: ' + colorLookup[cat] + ';" />');
                let activeIndicator = $('<div/>');
                activeIndicator.append(svgIndicator);
                activeIndicator.addClass('hx-indicator-spacer hx-indicator-active');
                column.append(activeIndicator);
            }else{
                column.append('<div class="hx-indicator-spacer"></div>');
            }


            // Insert icons of the right category, whether they're
            // the current one, its predecessors, or its successors.
            let rightIcons = [];
            rightIcons = rightIcons.concat(slide.id);
            rightIcons = rightIcons.concat(slide.previous.split(','));
            rightIcons = rightIcons.concat(slide.next.split(','));
            rightIcons = rightIcons.filter(x => x !== '');
            rightIcons = rightIcons.map(x => x.trim());

            rightIcons.forEach(function(e){
                s = lookupSlide(e);
                if(s.category === cat){
                    let iconHTML = $('<div/>');
                    iconHTML.addClass('hxslide-overview-item');

                    // If there's only one category, shrink the icons to
                    // allow more on the same line.
                    if(cats.length === 1){
                        iconHTML.css('max-width','100px');
                        iconHTML.css('min-width','50px');
                        iconHTML.css('padding','5px');
                    }

                    // If icons are in-scope, link them up.
                    let iconLink;
                    if(s.inScope){
                        iconLink = $('<a/>');
                        iconLink.attr('href','#');
                        iconLink.attr('data-target', s.id);
                    }else{
                        iconLink = $('<span/>');
                    }
                    iconHTML.append(iconLink);

                    let iconImage = $('<img/>');
                    iconImage.attr('src', staticFolder + s.ownicon);
                    if(!s.inScope){ iconImage.addClass('out-of-scope'); }
                    iconLink.append(iconImage);
                    if(s.id === slide.id){
                        iconLink.append('<strong style="color:black;">' + s.breadcrumb + '</strong>');
                        iconHTML.addClass('hxslide-active-item');
                        iconImage.css('filter','drop-shadow(0px 0px 10px rgb(0,0,0))');
                    }else{
                        iconLink.append(s.breadcrumb);
                    }

                    column.append(iconHTML);
                }
            });

            overview.append(column);
        });

        // Insert a separator if this isn't the last column

        return overview;

    }

    // For auto-generated map.
    // Currently unused and didn't quite work in the first place.
    function resizeItems(slide, options={}){
        let iconContainers = slide.find('.hxslide-overview-container');
        iconContainers.each(function(){
            let items = $(this).find('.hxslide-overview-item');
            let containerForSize = $(this);

            if(typeof options.fromCurrent !== 'undefined'){
                // Find the equivalent container in the current slide using class names.
                let allClassNames = $(this).attr('class').split(' ');
                let containerForSize = $(currentSlide()).find('.' + allClassNames.join('.'));
            }

            let num_icons = 4;
            console.log(containerForSize.width());
            let newWidth = containerForSize.width() / ( Math.ceil(num_icons / options.maxIconsTall) ) - 10;
            items.css('max-width', Math.min(newWidth, 200));
        });

    }

    // Add one-time link listeners.
    function addListeners(slick, slideData){

        // Add listeners to icons in *current* slide.
        backButton = $('.slick-current .backToParentSlide');
        homeSlideButton = $('.slick-current .goToHomeSlide');
        showOverviewButton = $('.slick-current .showOverview');

        // Home button
        if(options.startingSlide){
            homeSlideButton.off('click.hxhome tap.hxhome')
            .on('click.hxhome tap.hxhome', function(){ goToSlide(options.startingSlide); });
        }else{
            homeSlideButton.off('click.hxhome tap.hxhome')
            .on('click.hxhome tap.hxhome', function(){ goToSlide(slideData[0]); });
        }

        // Back button with backstop
        backButton.off('click.hxbk tap.hxbk').on('click.hxbk tap.hxbk', function(){
            // Don't go back if we're on the first slide.
            if(breadcrumbs.length > 1){
                goBackOne();
            }
        });

        // Make the back and home buttons active if needed.
        if(breadcrumbs.length > 1){
            homeSlideButton.removeClass('inactiveControl');
            backButton.removeClass('inactiveControl');
        }

        // Find links to other slides.
        let slideLinks = currentSlide().find('a').filter(function(){
            let slideTarget = $(this).attr('data-target');
            return typeof slideTarget !== 'undefined';
        });
        inScopeLinks = slideLinks.filter(function(){
            let slideTarget = $(this).attr('data-target');
            return lookupSlide(slideTarget).inScope;
        });
        outOfScopeLinks = slideLinks.filter(function(){
            let slideTarget = $(this).attr('data-target');
            return !lookupSlide(slideTarget).inScope;
        });

        // Remove out-of-scope links.
        outOfScopeLinks.each(function(){
            $(this).replaceWith($('<span>' + this.innerHTML + '</span>'));
        });

        // Go to in-scope links when they're clicked.
        inScopeLinks.off('click.hxsm tap.hxsm')
        .on('click.hxsm tap.hxsm', function(e){
            e.preventDefault();
            // Get the link target and go there.
            let target = $(this).attr('data-target');
            goToSlide(target);
        });

        // Enable collapsible sections
        let togglers = currentSlide().find('.hx-togglenext');
        togglers.next().hide();
        togglers.attr('tabindex','0');
        togglers.off('click.hxtog tap.hxtog').on('click.hxtog tap.hxtog', function(){
            // We're gonna toggle lots of stuff below.
            if( $(this).attr('aria-expanded') === 'true' ){
                $(this).attr('aria-expanded', 'false');
            }else{
                $(this).attr('aria-expanded', 'true');
            }
            $(this).find('span.hx-expandnote').text('Click to collapse');
            $(this).find('span.hx-collapsenote').text('Click to expand');
            $(this).find('span.fa').toggleClass('fa-caret-down fa-caret-right');
            $(this).find('span.sr').toggleClass('hx-expandnote hx-collapsenote');
            $(this).next().slideToggle(200);
            if( $(this).next().attr('aria-hidden') === 'true'){
                $(this).next().attr('aria-hidden', 'false');
            }else{
                $(this).next().attr('aria-hidden', 'true');
            }
        });

        // Add a FontAwesome icon for external links
        currentSlide().find('a').each(function(i, linky){
            let destination = $(linky).attr('href');
            if($(linky).find('.fa-external-link').length === 0){
                // isExternalLink() is defined in hx-js.
                if(isExternalLink(destination)){
                    $(linky).append(' <span class="fa fa-external-link"><span class="sr">External link</span></span>');
                }
            }
        });

        // Hide/show auto-generated overview map
        if(showOverviewButton.length > 0){
            showOverviewButton.removeClass('inactiveControl');

            let thisMap = $(currentSlide()).find('.hxslide-overview-bigbox');
            let leftbox = $(thisMap).find('.hxslide-overview-leftbox');
            let rightbox = $(thisMap).find('.hxslide-overview-rightbox');

            // if(options.overviewIsOpen){ resizeItems(currentSlide()); }

            showOverviewButton.off('click.hxmap tap.hxmap')
            .on('click.hxmap tap.hxmap', function(){
                thisMap.slideToggle();
                options.overviewIsOpen = !options.overviewIsOpen;

                // Accessibility and beautification toggles.
                if( $(this).attr('aria-expanded') === 'true' ){
                    $(this).attr('aria-expanded', 'false');
                    $(this).children('span.showOverviewNote').text(' Show Overview');
                    thisMap.attr('aria-hidden', 'true');
                }else{
                    $(this).attr('aria-expanded', 'true');
                    $(this).children('span.showOverviewNote').text(' Hide Overview');
                    thisMap.attr('aria-hidden', 'false');
                }

                $(this).children('span.fa').toggleClass('fa-chevron-down fa-chevron-right');

                // resizeItems(currentSlide());

                $(window).off('resize.hx').on('resize.hx', function(){
                    // resizeItems(currentSlide());
                });

            });
        }

    }

    // For the back button and the breadcrumbs
    function goBackOne(){
        // Update breadcrumb list and the history.
        breadcrumbs.pop();
        history.pop();

        // Get the position of the back button.
        let oldHeight = $(currentSlide()).find('.backToParentSlide').offset().top;

        // Go to the last slide in the history.
        HXslider.slick('slickGoTo', HXslider.slick('slickCurrentSlide') - 1);
        // Remove the last slide on our list.
        HXslider.slick('slickRemove', removeBefore=false);
        // If appropriate, grey out the back button.
        if(breadcrumbs.length == 1){
            backButton.addClass('inactiveControl');
            homeSlideButton.addClass('inactiveControl');
        }

        // Scroll the screen so the cursor is over the back button again.
        let heightDiff = $(currentSlide()).find('.backToParentSlide').offset().top - oldHeight;
        window.scrollBy(0, heightDiff);
    }

    // Takes slide HTML, adds it to the DOM, and sets listeners.
    function addSlide(slick, slideHTML){
        slick.slickAdd(slideHTML);
    }

    // Go to a specific slide and handle the history list.
    function goToSlide(slideID){
        // If we're already at this slide, do nothing.
        if(slideID !== currentSlide().data('slideId')){
            // Hide the current nav overview if we're in hiding mode.
            if(!options.overviewIsOpen){
                $('.hxslide-overview-bigbox').hide();
            }

            let newSlide = lookupSlide(slideID);
            // Regardless of whether this slide is in the current stack,
            // make a new copy and move to it. Don't slide back.
            HXslider.slick('addSlide', getSlideHTML(newSlide));
            // TODO: Resize images on new slide before we go there.
            // Use this slide's current to set sizes on (hidden) next slide?
            // This is all for smoother interface, not 100% vital.
            // resizeItems(currentSlide(), {fromCurrent: true});
            // Go to that slide.
            HXslider.slick('slickGoTo',history.length + 1);
            // Update history list.
            history.push( currentSlide().attr('data-slide-id') );
            // Update breadcrumb list.
            breadcrumbs.push( currentSlide().attr('data-breadcrumb') );

            // Hide/Show handler
            let overviewButton = $('.showOverview');
            if( $('.hxslide-overview-bigbox').is(':visible') ){
                overviewButton.attr('aria-expanded','true');
                overviewButton.children('.fa').addClass('fa-chevron-down');
                overviewButton.children('.fa').removeClass('fa-chevron-right');
                overviewButton.children('.showOverviewNote').text(' Hide Overview');
            }else{
                overviewButton.attr('aria-expanded','false');
                overviewButton.children('.fa').addClass('fa-chevron-right');
                overviewButton.children('.fa').removeClass('fa-chevron-down');
                overviewButton.children('.showOverviewNote').text(' Show Overview');
            }
        }
    }

    // Set up initial listeners
    HXslider.on('init', function(e, slick){

        // Set up the first slide and drop it into the slider.
        // But wait for the data first.
        let waitForData = setInterval(function(){
            console.log('waiting for slide data...');
            if(typeof slideData[0] !== 'undefined'){
                console.log('Slide data loaded.');
                if(options.startingSlide){
                    addSlide(slick, getSlideHTML(lookupSlide(options.startingSlide)));
                }else{
                    addSlide(slick, getSlideHTML(slideData[0]));
                }

                // Remove the "Initializing" slide.
                slick.slickRemove(0);
                // Set initial history
                history.push( currentSlide().attr('data-slide-id') );
                // Set initial breadcrumbs
                breadcrumbs.push( currentSlide().attr('data-breadcrumb') );
                addListeners(slick, slideData);
                clearInterval(waitForData);
            }
        }, 250);
    });

    // Handle focus
    HXslider.on('afterChange', function(e, slick){
        // Handle keyboard focus manually after slides change.
        currentSlide().focus();
        addListeners(slick, slideData);
    });

    // Bring in the CSV file.
    if(typeof options !== 'undefined'){
        if(options.slidesFile){
            let csvfile = options.slidesFile;
            if(csvfile.indexOf('/static/') != -1){
                csvfile = getAssetURL(window.location.href, 'complete') + csvfile;
            }

            // We're including the Papa CSV parser in the HTML,
            // so make sure it loads completely before trying to use it.
            let waitForPapa = setInterval(function(){
                console.log('waiting for CSV parser...');
                if(typeof Papa !== 'undefined'){
                    Papa.parse(csvfile, {
                        download: true,
                        header: true,
                        complete: function(results) {
                            console.log(results);
                            slideData = makeSlideArray(results.data);
                            console.log(slideData);
                        }
                    });
                    clearInterval(waitForPapa);
                }
            }, 250);

        }else{
            console.log('Slides file not specified.');
        }

    }else{
        console.log('No options specified.');
    }

    window.HXGoToSlide = goToSlide;

});
