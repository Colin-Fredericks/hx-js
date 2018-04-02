/*************************************************************
/ Text slider for use within edX
/ Created at HarvardX
/ Requirements:
/  * Slick image slider https://kenwheeler.github.io/slick/
/  * PapaParse csv parser https://github.com/mholt/PapaParse
/  * HX-JS, which provides Slick and the getAssetURL function
/           https://github.com/Colin-Fredericks/hx-js
*************************************************************/

var HXTextSlider = (function() {

  var history = [];
  var breadcrumbs = [];
  // Uncomment below for breadcrumbs.
  // var crumbTray = $('.slideBreadcrumbs');
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
    return newSlideData;
  }

  // Returns the div for the current slide.
  function currentSlide(){
    var cs = $($('.slick-current')[0]);
  	return cs;
  }

  // HTML formatting for the breadcrumbs
  // Uncomment below for breadcrumbs.
  // function formatCrumbs(crumbs){
  //   var crumbtext = '';
  //   // crumbtext = crumbs.join(' » ');
  //   for (var i = 0; i < crumbs.length; i++){
  //     crumbtext += '<a href="#" class="bclink" data-target="' + history[i]
  //       + '" data-goback="' + (crumbs.length - i)
  //       + '">';
  //     crumbtext += crumbs[i];
  //     crumbtext += '</a>';
  //     if(i+1 < crumbs.length){
  //       crumbtext += ' » ';
  //     }
  //   }
  // 	return crumbtext;
  // }

  // Returns the object for the slide with id slideName
  function lookupSlide(slideName){
    for(var i = 0; i < slideData.length; i++){
      if(slideData[i].id == slideName){
        return slideData[i];
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

    slideHTML += '<div class="hx-slidelayout">';

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

    slideHTML += '<div class="hx-rightbox">';

    slideHTML += '<figure>'
    slideHTML += '<a href="' + slide.image + '" target="_blank">';
    slideHTML += '<img src="' + slide.image + '" alt="' + slide.alt + '" />';
    slideHTML += '</a>';
    slideHTML += '<figcaption>' + slide.caption + '</figcaption>'
    slideHTML += '</figure>'


    // All the icons under the icon, if any.
    // Commented because it's not currently in use - replaced by previous/next
    // slideHTML += '<div class="slideicons">';
    // for(var i = 0; i < slide.icons.length; i++){
    //   if(slide.icons[i].image !== ''){
    //     slideHTML += '<a data-target="' + slide.icons[i].target + '" href="">';
    //     slideHTML += '<img src="' + staticFolder + slide.icons[i].image
    //       + '" alt="' + slide.icons[i].alt
    //       + '" width="65px" />';
    //     slideHTML += '</a>';
    //   }
    // }
    // slideHTML += '</div>';

    slideHTML += '</div>';

    slideHTML += '</div>';

    function prevNextHTML(targetList){
      var html = '';
      targetList.forEach(function(e){
        tempslide = lookupSlide(e.trim())
        html += '<div class="hx-prevnext-icons"><a href="#" data-target="' + e.trim() + '">';
        html += '<img src="' + staticFolder + tempslide.ownicon
          + '" width="65px" alt="" />'
        html += tempslide.breadcrumb;
        html += '</a></div>';
      });
      return html;
    }

    slideHTML += '<div class="hx-text-slider-nav">';

    if(slide.previous){
      slideHTML += '<div class="hx-previous">'
      slideHTML += '<h4>Causes</h4>'
      slideHTML += '<div class="hx-previous-icons">'
      slideHTML += prevNextHTML( slide.previous.split(',') );
      slideHTML += '</div></div>';
    }
    if(slide.next){
      slideHTML += '<div class="hx-next">'
      slideHTML += '<h4>Effects</h4>'
      slideHTML += '<div class="hx-next-icons">'
      slideHTML += prevNextHTML( slide.next.split(',') );
      slideHTML += '</div></div>';
    }

    slideHTML += '</div>';

    return slideHTML;
  }

  // Add one-time link listeners.
  function addListeners(slick, slideData){

    // Handle links to other slides
    currentSlide().find('a').filter(function(){
      return $(this).attr('data-target') !== 'undefined';
    }).off('click.hxsm tap.hxsm').on('click.hxsm tap.hxsm', function(e){
      e.preventDefault();
      // Get the link target and go there.
      var target = $(this).attr('data-target');
      goToSlide(target);
    });

    // Uncomment to handle breadcrumb clicks
    // $('.bclink').one('click tap', function(e){
    //   e.preventDefault();
    //   var backNum = $(this).attr('data-goback');
    //   for(var i = 1; i < backNum; i++){ goBackOne(); }
    // });

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

  function goToSlide(slideID){
    // If we're already at this slide, do nothing.
    if(slideID !== currentSlide().data('slideId')){
      var newSlide = lookupSlide(slideID);
      // Regardless of whether this slide is in the current stack,
      // make a new copy and move to it. Don't slide back.
      HXslider.slick('addSlide', getSlideHTML(newSlide));
      // Go to that slide.
      HXslider.slick('slickGoTo',history.length + 1);
      // Make the back button active.
      backButton.addClass('canGoBack');
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
        if('startingSlide' in window){
          addSlide(slick, getSlideHTML(lookupSlide(startingSlide)));
        }else{
          addSlide(slick, getSlideHTML(slideData[0]));
        }
        // Remove the "Initializing" slide.
        slick.slickRemove(0);
        // Set initial history
        history.push( currentSlide().attr('data-slide-id') );
        // Set initial breadcrumbs
        breadcrumbs.push( currentSlide().attr('data-breadcrumb') );
        // Uncomment below for breadcrumbs.
        // crumbTray.html(formatCrumbs(breadcrumbs));
        addListeners(slick, slideData);
        clearInterval(waitForData);
      }
    }, 250);
  });

  HXslider.on('afterChange', function(e, slick){
    // Uncomment below for breadcrumbs.
    // crumbTray.html(formatCrumbs(breadcrumbs));
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

    // We're including the Papa CSV parser in the HTML,
    // so make sure it loads completely before trying to use it.
    var waitForPapa = setInterval(function(){
      console.log('waiting for CSV parser...');
      if(typeof Papa !== 'undefined'){
        Papa.parse(csvfile, {
          download: true,
          header: true,
          complete: function(results) {
            slideData = makeSlideArray(results.data);
            console.log(results);
            console.log(slideData);
          }
        });
        clearInterval(waitForPapa);
      }
    }, 250);

  }else{
    console.log('Slides file not specified.');
  }

  window.HXGoToSlide = goToSlide;

});


$(document).ready(function() {
  HXTextSlider();
});
