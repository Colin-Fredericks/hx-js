/*************************************************************
/ Text slider for use within edX
/ Created at HarvardX
/ Requirements:
/  * Slick image slider https://kenwheeler.github.io/slick/
/  * PapaParse csv parser https://github.com/mholt/PapaParse
*************************************************************/

$(document).ready(function(){

  var depth = 0;
  var history = [];
  var breadcrumbs = [];
  var crumbTray = $('.slideBreadcrumbs');
  var backButton = $('.backToParentSlide');
  var HXslider = $('.hx-slider');
  var slideData = [];

  // Process flat data into more useful structure. Particularly,
  // get icons as array instead of a bunch of separate entries.
  function makeSlideArray(sd){
    // Valid keys: Icon#, Icon#Target	Icon#Alt
    var newSlideData = [];

    sd.forEach(function(e){
      var newElement = {};
      newElement.icons=[];
      Object.keys(e).forEach( function(key, i){
        lowerkey = key.toLowerCase();
        newElement[lowerkey] = e[key];
        if(key.indexOf('Icon') != -1){
          // 5th character is always the number,
          // and we don't allow more than 9 icons.
          var iconNum = parseInt(key[4]) - 1;
          if( typeof newElement.icons[iconNum] === 'undefined' ){
            newElement.icons[iconNum] = {};
          }
          if( key == 'Icon' + (iconNum + 1) ){
            newElement.icons[iconNum].image = e[key];
          }else if( key == 'Icon' + (iconNum + 1) + 'Target' ){
            newElement.icons[iconNum].target = e[key];
          }else if( key == 'Icon' + (iconNum + 1) + 'Alt' ){
            newElement.icons[iconNum].alt = e[key];
          }else{
            console.log('Weird key detected: ' + key)
          }
        }
      });
      newSlideData.push(newElement);
    });
    return newSlideData;
  }

  // Returns the div for the current slide.
  function currentSlide(){
    var cs = $($('.slick-current')[0]);
  	return cs;
  }

  // HTML formatting for the breadcrumbs
  function formatCrumbs(crumbs){
    var crumbtext = '';
    // crumbtext = crumbs.join(' » ');
    for (i = 0; i < crumbs.length; i++){
      crumbtext += '<a href="#" class="bclink" data-target="' + history[i]
        + '" data-goback="' + (crumbs.length - i)
        + '">';
      crumbtext += crumbs[i];
      crumbtext += '</a>';
      if(i+1 < crumbs.length){
        crumbtext += ' » ';
      }
    }
  	return crumbtext;
  }

  // Returns the object for the slide with id slideName
  function lookupSlide(slides, slideName){
    for(i = 0; i < slides.length; i++){
      if(slides[i].id == slideName){
        return slides[i];
      }
    }
    console.log('Cannot find slide whose id matches the link\'s target.');
  }

  // Takes a slide object and returns the HTML for it.
  function getSlideHTML(slide){
    var staticFolder = getAssetURL(window.location.href, 'complete');

    var slideHTML = '';
    slideHTML += '<div data-breadcrumb="' + slide.breadcrumb
      + '" data-slide-id="' + slide.id
      + '" tabindex="-1">';
    slideHTML += '<h3>' + slide.title + '</h3>';

    slideHTML += '<div class="rightbox hx-hangright">'
    slideHTML += '<div class="slideicons">'
    for(i = 0; i < slide.icons.length; i++){
      slideHTML += '<a data-target="' + slide.icons[i].target + '" class="slidelink" href="">';
      slideHTML += '<img src="' + staticFolder + slide.icons[i].image
        + '" alt="' + slide.icons[i].alt
        + '" width="75px" />';
      slideHTML += '</a>';
    }
    slideHTML += '</div>'

    slideHTML += '<img src="' + slide.image + '" alt="' + slide.alt + '" />';
    slideHTML += '</div>';

    slideHTML += '<div class="slidetext">' + slide.text + '</div>';
    slideHTML += '</div>';

    return slideHTML;
  }

  // Add one-time link listeners.
  function addListeners(slick, slideData){
    currentSlide().find('.slidelink').one('click tap', function(e){
      e.preventDefault();
      // Get the link target.
      var target = $(this).attr('data-target');
      var newSlide = lookupSlide(slideData, target);
      // Insert new slide.
      addSlide(slick, getSlideHTML(newSlide))
      // Go to that slide.
      HXslider.slick('slickGoTo',depth+1);
      depth += 1;
      // Update history list.
      history.push( currentSlide().attr('data-slide-id') );
      // Update breadcrumb list.
      breadcrumbs.push( currentSlide().attr('data-breadcrumb') );
      // Make the back button active.
      backButton.addClass('canGoBack');
    });
    $('.bclink').one('click tap', function(e){
      console.log('breadcrumb clicked');
      e.preventDefault();
      var backNum = $(this).attr('data-goback');
      for(i = 1; i < backNum; i++){ goBackOne(); }
    });
  }

  // For the back button and the breadcrumbs
  function goBackOne(){
    depth -= 1;
    // Update breadcrumb list and the history.
    breadcrumbs.pop();
    history.pop();
    // Go to the last slide in the history.
    HXslider.slick('slickGoTo', HXslider.slick('slickCurrentSlide') - 1);
    // Remove the last slide on our list.
    HXslider.slick('slickRemove', removeBefore=false)
    // If appropriate, grey out the back button.
    if(breadcrumbs.length == 1){
      backButton.removeClass('canGoBack');
    }
  }

  // Takes slide HTML, adds it to the DOM, and sets listeners.
  function addSlide(slick, slideHTML){
    slick.slickAdd(slideHTML);
  }

  // Set up initial listeners
  HXslider.on('init', function(e, slick){
    // Set up the first slide and drop it into the slider.
    // But wait for the data first.
    var waitForData = setInterval(function(){
      console.log('waiting for slide data...');
      if(typeof slideData[0] !== 'undefined'){
        console.log('Slide data loaded.');
        addSlide(slick, getSlideHTML(slideData[0]));
        // Remove the "Initializing" slide.
        slick.slickRemove(0)
        // Set initial history
        history.push( currentSlide().attr('data-slide-id') );
        // Set initial breadcrumbs
        breadcrumbs.push( currentSlide().attr('data-breadcrumb') );
        crumbTray.html(formatCrumbs(breadcrumbs));
        addListeners(slick, slideData);
        clearInterval(waitForData);
      }
    }, 250);
  });

  HXslider.on('afterChange', function(e, slick){
    console.log('slide changed');
    // Update breadcrumbs
    crumbTray.html(formatCrumbs(breadcrumbs));
    // Handle keyboard focus manually after slides change.
    currentSlide().focus();
    addListeners(slick, slideData);
  });

  $('.backToParentSlide').on('click tap', function(){
    // Don't go back if we're on the first slide.
    if(breadcrumbs.length > 1){
      goBackOne();
    }
  });

  // Bring in the CSV file.
  if('slidesFile' in window){
    var csvfile = slidesFile;
    if(slidesFile.indexOf('/static/') != -1){
      csvfile = getAssetURL(window.location.href, 'complete') + csvfile;
    }
    Papa.parse(csvfile, {
      download: true,
      header: true,
      complete: function(results) {
        slideData = makeSlideArray(results.data)
        console.log(results);
        console.log(slideData);
      }
    });
  }else{
    console.log('Slides file not specified.')
  }


});