$(document).ready(function(){

  var depth = 0;
  var history = [];
  var breadcrumbs = [];
  var crumbTray = $('.slideBreadcrumbs');
  var backButton = $('.backToParentSlide');

  function currentSlide(){
    // Returns the div for the current slide.
  	return $($('.slick-current')[0]).children().first().children().first();
  }

  function formatCrumbs(crumbs){
  	return crumbs.join(' » ');
  }

  $('.hx-slider').on('init', function(){
    // Set initial breadcrumbs
	  breadcrumbs.push( currentSlide().attr('data-breadcrumb') );
	  crumbTray.text(breadcrumbs[0]);
  });

  $('.hx-slider').on('afterChange', function(){
    // Update breadcrumbs
    crumbTray.html(formatCrumbs(breadcrumbs));
    // Handle keyboard focus manually after slides change.
    currentSlide().focus();
  });

  $('.slidelink').on('click tap', function(){
    // Get the link target
    var target = $(this).attr('data-target');
    history.push( $('.hx-slider').slick('slickCurrentSlide') );
    $('.hx-slider').slick('slickGoTo',target);
    breadcrumbs.push( currentSlide().attr('data-breadcrumb') );
    backButton.addClass('canGoBack');
  });

  $('.backToParentSlide').on('click tap', function(){
    if(breadcrumbs.length > 1){
	  breadcrumbs.pop();
	  $('.hx-slider').slick('slickGoTo',history.pop());
	  if(breadcrumbs.length == 1){
		  backButton.removeClass('canGoBack');
	  }
	}
  });
});
