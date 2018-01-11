$(document).ready(function(){

  var depth = 0;
  var history = [];
  var breadcrumbs = [];
  var crumbTray = $('.slideBreadcrumbs');
  var backButton = $('.backToParentSlide');
  var HXslider = $('.hx-slider');

  // Returns the div for the current slide.
  function currentSlide(){
  	return $($('.slick-current')[0]).children().first().children().first();
  }

  function formatCrumbs(crumbs){
  	return crumbs.join(' » ');
  }

  // Returns the object for the slide with id slideName
  function lookupSlide(slides, slideName){
    for(i = 0; i < slides.length; i++){
      console.log(slides[i].id);
      if(slides[i].id == slideName){
        return slides[i];
      }
    }
    console.log('Cannot find slide whose id matches the link\'s target.');
  }

  // Takes a slide object and returns the HTML for it.
  function getSlideHTML(slide){
    var slideHTML = '';
    slideHTML += '<div data-breadcrumb="' + slide.breadcrumb + '" tabindex="-1">';
    slideHTML += '<img src="' + slide.image + '" alt="' + slide.alt + '" />';
    slideHTML += '<h3>' + slide.title + '</h3>';
    slideHTML += slide.text;
    slideHTML += '</div>';

    return slideHTML;
  }

  // Takes slide HTML, adds it to the DOM, and sets listeners.
  function addSlide(slick, slideHTML){
    slick.slickAdd(slideHTML);
    // Add link listener
    $('.slidelink').on('click tap', function(e){
      e.preventDefault();
      // Get the link target.
      var target = $(this).attr('data-target');
      var newSlide = lookupSlide(sampleSlides, target);
      // Update history list.
      history.push( HXslider.slick('slickCurrentSlide') );
      // Insert new slide.
      addSlide(slick, getSlideHTML(newSlide))
      // Go to that slide.
      HXslider.slick('slickGoTo',depth+1);
      depth += 1;
      // Update breadcrumb list.
      breadcrumbs.push( currentSlide().attr('data-breadcrumb') );
      // Make the back button active.
      backButton.addClass('canGoBack');
    });
  }

  HXslider.on('init', function(e, slick){
    // Set up the first slide and drop it into the slider.
    addSlide(slick, getSlideHTML(sampleSlides[0]));
    // Remove the "Initializing" slide.
    slick.slickRemove(0)
    // Set initial breadcrumbs
	  breadcrumbs.push( currentSlide().attr('data-breadcrumb') );
	  crumbTray.text(breadcrumbs[0]);
  });

  HXslider.on('afterChange', function(){
    // Update breadcrumbs
    crumbTray.html(formatCrumbs(breadcrumbs));
    // Handle keyboard focus manually after slides change.
    currentSlide().focus();
  });

  $('.backToParentSlide').on('click tap', function(){
    // Don't go back if we're on the first slide.
    if(breadcrumbs.length > 1){
      depth -= 1;
      // Update breadcrumb list.
  	  breadcrumbs.pop();
      // Go to the last slide in the history.
  	  HXslider.slick('slickGoTo',history.pop());
      // Remove the last slide on our list.
      HXslider.slick('slickRemove', removeBefore=false)
      // If appropriate, grey out the back button.
  	  if(breadcrumbs.length == 1){
  		  backButton.removeClass('canGoBack');
  	  }
  	}
  });
});
