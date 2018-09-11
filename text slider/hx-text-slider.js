/*************************************************************
/ Text slider for use within edX
/ Dynamically loads a CSV file to create interactive slides.
/ Created at HarvardX
/ Requirements:
/  * Slick image slider https://kenwheeler.github.io/slick/
/  * PapaParse csv parser https://github.com/mholt/PapaParse
/  * HX-JS, which provides Slick and the getAssetURL function
/           https://github.com/Colin-Fredericks/hx-js
*************************************************************/

var HXTextSlider = (function(options) {

  var history = [];
  var breadcrumbs = [];
  var backButton = $('.slick-current.backToParentSlide');
  var homeSlideButton = $('.slick-current.goToHomeSlide');
  var showOverviewMap = $('.slick-current.showOverviewMap');
  var HXslider = $('.hx-slider');
  var slideData = [];
  var iconsize = 65; //pixels

  var colorLookup = {
    'red': '#c00000',
    'green': '#00B050',
    'cyan': '#4adec4',
    'yellow': '#FFC001',
    'blue': '#475292'
  }

  // Process flat data into more useful structure. Particularly,
  // get icons as array instead of a bunch of separate entries.
  function makeSlideArray(sd){
    // Valid keys: Icon#, Icon#Target	Icon#Alt
    var newSlideData = [];

    sd.forEach(function(e){
      var newElement = {};
      newElement.icons=[];
      newElement.folds=[];
      Object.keys(e).forEach( function(key, i){
        var lowerkey = key.toLowerCase();
        newElement[lowerkey] = e[key];

        // Make arrays for headers and folded texts
        if(key.indexOf('Fold') === 0){
          // Last character is the number, no more than 9.
          var foldNum = parseInt(key[key.length-1]) - 1;
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
          var iconNum = parseInt(key[key.length-1]) - 1;
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
    if(options.slideScope !== []){
      for(var i=0; i < options.slideScope.length; i++){
        scopeInSlides = false;
        for(var j=0; j< newSlideData.length; j++){
          if(options.slideScope[i] == newSlideData[j].id){
            scopeInSlides = true;
            break;
          }
        }
        if(!scopeInSlides){
          console.log(options.slideScope[i] + ' is in scope but not in the current slide list.');
        }
      }
    }else{
      console.log('No scoping for these slides.');
    }


    return newSlideData;
  }

  // Returns the div for the current slide.
  function currentSlide(){
    var cs = $($('.slick-current')[0]);
  	return cs;
  }

  // Returns the object for the slide with id slideName
  function lookupSlide(slideName){
    for(var i = 0; i < slideData.length; i++){
      if(slideData[i].id == slideName){
        return slideData[i];
      }
    }
    console.log('Cannot find slide whose id matches the link\'s target: ' + slideName);
  }

  // Takes a slide object and returns the HTML for it.
  function getSlideHTML(slide){
    var staticFolder = getAssetURL(window.location.href, 'complete');

    var slideHTML = '';

    // Breadcrumbs
    slideHTML += '<div data-breadcrumb="' + slide.breadcrumb
      + '" data-slide-id="' + slide.id
      + '" tabindex="-1">';

    // Icon and title
    slideHTML += '<img class="hx-slide-icon" alt="" '
      + 'width="' + iconsize + 'px"'
      + 'src="' + staticFolder + slide.ownicon + '"/>';
    slideHTML += '<h3 class="hx-slide-title" style="border-bottom: 2px solid '
      + colorLookup[slide.category]
      + ';">' + slide.title + '</h3><br clear="all"/>';

    slideHTML += '<div class="hx-slidelayout">';

    // Left part, with text
    slideHTML += '<div class="hx-leftbox">';
    slideHTML += slide.abovefold;

    // All the collapsible bits, if any.
    for(var j = 0; j < slide.folds.length; j++){
      if(slide.folds[j].header !== ''){
        slideHTML += '<h4 class="hx-togglenext" tabindex="0" '
            + 'aria-expanded="false" aria-controls="hx-folded-' + j + '">';
        slideHTML += '<span class="fa fa-caret-right"></span> ';
        slideHTML += slide.folds[j].header;
        slideHTML += ' <span class="sr hx-expandnote">Click to expand</span></h4>';
        slideHTML += '<div id="hx-folded-' + j + '" aria-hidden="true">'
            + slide.folds[j].text + '</div>';
      }
    }
    slideHTML += '</div>';

    // Right part, with optional figure
    slideHTML += '<div class="hx-rightbox">';

    slideHTML += '<figure>'
    slideHTML += '<a href="' + slide.image + '" target="_blank">';
    slideHTML += '<img src="' + slide.image + '" alt="' + slide.alt + '" />';
    slideHTML += '</a>';
    slideHTML += '<figcaption>' + slide.caption + '</figcaption>'
    slideHTML += '</figure>'

    slideHTML += '</div>';

    slideHTML += '</div>';

    slideHTML += getControlBoxHTML().html();

    // Hidden navigation drawer right below the breadcrumbs.
    slideHTML += getOverviewHTML(slide);

    return slideHTML;
  }

  // This is the container for the back, home, and hide/show buttons.
  function getControlBoxHTML(){
    let controlHTML = $('<div/>');
    let backButton = $('<button/>');
    let homeButton = $('<button/>');
    let overviewButton = $('<button/>');

    controlHTML.addClass('controlbox');

    backButton.addClass('backToParentSlide');
    backButton.append('<span class="fa fa-arrow-circle-left"><span class="sr">Previous Topic</span></span>');

    homeButton.addClass('goToHomeSlide canGoBack');
    homeButton.append('<span class="fa fa-home"><span class="sr">Home Slide</span></span>');

    overviewButton.addClass('showOverviewMap');
    overviewButton.append('<span class="fa fa-eye"><span class="sr">Visual Map</span></span>');

    controlHTML.append(backButton);
    controlHTML.append(homeButton);
    controlHTML.append(overviewButton);

    return controlHTML;
  }

  // Takes a slide object and returns the HTML for the local overview.
  function getOverviewHTML(slide){

    var staticFolder = getAssetURL(window.location.href, 'complete');
    var overview = '<div class="hxslide-overview-bigbox hxslide-overview-master" ';
    if(!options.overviewIsOpen){
      overview += 'style="display: none;"';
    }
    overview += '">'

    // Split the lists of previous and next slides and return appropriate html
    function overviewSideHTML(targetList){
      var html = '';
      targetList.forEach(function(e){
        var tempslide = lookupSlide(e.trim())
        var outOfScope = (options.slideScope.indexOf(tempslide.id) === -1) && options.slideScope.length > 0;
        html += '<div class="hxslide-overview-item">';
        html += '<a href="#" data-target="' + e.trim() + '">'
        html += '<img src="' + staticFolder + tempslide.ownicon + '">';
        html += tempslide.breadcrumb;
        html += '</a>';
        html += '</div>';
      });
      return html;
    }

    // Leftmost box, with "previous" icons.
    overview += '<div class="hxslide-overview-leftbox hxslide-overview-container">'
    if(slide.previous){ overview += overviewSideHTML( slide.previous.split(',') ); }
    overview += '</div>'

    // A bracket, if there are previous items.
    if(slide.previous.length > 0){
      overview += '<div class="hxslide-overview-leftbracket">';
      overview += '<img src="' + staticFolder + 'leads-to.jpg">';
      overview += '</div>';
    }

    // Central icon
    overview += '<div class="hxslide-overview-centerbox hxslide-overview-container">';
    overview += '<div class="hxslide-overview-keystone hxslide-overview-item">';
    overview += '<img src="' + staticFolder + slide.ownicon + '">';
    overview += slide.title;
    overview += '</div>';
    overview += '</div>';

    // Another bracket, if there are next items.
    if(slide.next.length > 0){
      overview += '<div class="hxslide-overview-rightbracket">';
      overview += '<img src="' + staticFolder + 'leads-to.jpg">';
      overview += '</div>';
    }

    // Rightmost box, with "next" icons.
    overview += '<div class="hxslide-overview-rightbox hxslide-overview-container">';
    if(slide.next){ overview += overviewSideHTML( slide.next.split(',') ); }
    overview += '</div>';

    overview += '</div>';

    return overview;

  }

  // For auto-generated map
  function resizeItems(leftbox, rightbox){
    var left_items = $(leftbox).find('.hxslide-overview-item');
    var right_items = $(rightbox).find('.hxslide-overview-item');
    var num_left = left_items.length;
    var num_right = right_items.length;

    left_width = leftbox.width() / ( Math.ceil(num_left / options.maxIconsTall) ) - 10;
    right_width = rightbox.width() / ( Math.ceil(num_right / options.maxIconsTall) ) - 10;
    left_items.css('max-width', Math.min(left_width, 200));
    right_items.css('max-width', Math.min(right_width, 200));
  }

  // Add one-time link listeners.
  function addListeners(slick, slideData){

    // Add listeners to icons in *current* slide.
    backButton = $('.slick-current .backToParentSlide');
    homeSlideButton = $('.slick-current .goToHomeSlide');
    showOverviewMap = $('.slick-current .showOverviewMap');

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

    // Make the back button active if needed.
    if(breadcrumbs.length > 1){
        backButton.addClass('canGoBack');
    }

    // Handle links to other slides
    currentSlide().find('a').filter(function(){
      return typeof $(this).attr('data-target') !== 'undefined';
    }).off('click.hxsm tap.hxsm')
    .on('click.hxsm tap.hxsm', function(e){
      e.preventDefault();
      // Get the link target and go there.
      var target = $(this).attr('data-target');
      goToSlide(target);
    });

    // Enable collapsible sections
    var togglers = currentSlide().find('.hx-togglenext');
    togglers.next().hide();
    togglers.attr('tabindex','0');
    togglers.off('click.hxtog tap.hxtog').on('click.hxtog tap.hxtog', function(){
      // We're gonna toggle lots of stuff below.
      if( $(this).attr('aria-expanded') === 'true' ){
        $(this).attr('aria-expanded', 'false');
      }else{
        $(this).attr('aria-expanded', 'true');
      };
      $(this).find('span.hx-expandnote').text('Click to collapse');
      $(this).find('span.hx-collapsenote').text('Click to expand');
      $(this).find('span.fa').toggleClass('fa-caret-down fa-caret-right');
      $(this).find('span.sr').toggleClass('hx-expandnote hx-collapsenote');
      $(this).next().slideToggle(200);
      if( $(this).next().attr('aria-hidden') === 'true'){
        $(this).next().attr('aria-hidden', 'false');
      }else{
        $(this).next().attr('aria-hidden', 'true');
      };
    });

    // Add a FontAwesome icon for external links
    currentSlide().find('a').each(function(i, linky){
      var destination = $(linky).attr('href');
      if($(linky).find('.fa-external-link').length === 0){
        // isExternalLink() is defined in hx-js.
        if(isExternalLink(destination)){
          $(linky).append(' <span class="fa fa-external-link"><span class="sr">External link</span></span>');
        }
      }
    });

    // Hide/show auto-generated overview map
    if(showOverviewMap.length > 0){
      showOverviewMap.addClass('canGoBack');

      var thisMap = $(currentSlide()).find('.hxslide-overview-bigbox');
      var leftbox = $(thisMap).find('.hxslide-overview-leftbox');
      var rightbox = $(thisMap).find('.hxslide-overview-rightbox');

      if(options.overviewIsOpen){ resizeItems(leftbox, rightbox); }

      showOverviewMap.off('click.hxmap tap.hxmap')
        .on('click.hxmap tap.hxmap', function(){
          thisMap.slideToggle();
          options.overviewIsOpen = !options.overviewIsOpen;

          resizeItems(leftbox, rightbox);

          $(window).off('resize.hx').on('resize.hx', function(){
            resizeItems(leftbox, rightbox);
          });

      });
    }

  }

  // For the back button and the breadcrumbs
  function goBackOne(){
    // Update breadcrumb list and the history.
    breadcrumbs.pop();
    history.pop();
    // Go to the last slide in the history.
    HXslider.slick('slickGoTo', HXslider.slick('slickCurrentSlide') - 1);
    // Remove the last slide on our list.
    HXslider.slick('slickRemove', removeBefore=false);
    // If appropriate, grey out the back button.
    if(breadcrumbs.length == 1){
      backButton.removeClass('canGoBack');
    }
  }

  // Takes slide HTML, adds it to the DOM, and sets listeners.
  function addSlide(slick, slideHTML){
    slick.slickAdd(slideHTML);
  }

  // Go to a specific slide and handle the history list.
  function goToSlide(slideID){
    // If we're already at this slide, do nothing.
    if(slideID !== currentSlide().data('slideId')){
      // Hide the current nav overview we're in hiding mode
      if(!options.overviewIsOpen){
        $('.hxslide-overview-bigbox').hide();
      }

      var newSlide = lookupSlide(slideID);
      // Regardless of whether this slide is in the current stack,
      // make a new copy and move to it. Don't slide back.
      HXslider.slick('addSlide', getSlideHTML(newSlide));
      // Go to that slide.
      HXslider.slick('slickGoTo',history.length + 1);
      // Update history list.
      history.push( currentSlide().attr('data-slide-id') );
      // Update breadcrumb list.
      breadcrumbs.push( currentSlide().attr('data-breadcrumb') );
    }
  }

  // Set up initial listeners
  HXslider.on('init', function(e, slick){

    // Set up the first slide and drop it into the slider.
    // But wait for the data first.
    var waitForData = setInterval(function(){
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
    // Uncomment below for breadcrumbs.
    // crumbTray.html(formatCrumbs(breadcrumbs));
    // Handle keyboard focus manually after slides change.
    currentSlide().focus();
    addListeners(slick, slideData);
  });

  // Bring in the CSV file.
  if(typeof options !== 'undefined'){
    if(options.slidesFile){
      var csvfile = options.slidesFile;
      if(csvfile.indexOf('/static/') != -1){
        csvfile = getAssetURL(window.location.href, 'complete') + csvfile;
      }

      // We're including the Papa CSV parser in the HTML,
      // so make sure it loads completely before trying to use it.
      var waitForPapa = setInterval(function(){
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
