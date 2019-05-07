// Check for local options object.
if (typeof hxLocalOptions === 'undefined') {
  var hxLocalOptions = {};
}

// Check for local timers for pop-up problems.
if (typeof HXPUPTimer === 'undefined') {
  var HXPUPTimer = [];
}

// Check for local timers for chimes.
if (typeof HXChimeTimer === 'undefined') {
  var HXChimeTimer = [];
}

var HXGlobalJS = function(hxLocalOptions, HXPUPTimer, HXChimeTimer) {
  'use strict';

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
      focusOnChange: true,
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
      focusOnChange: true,
      adaptiveHeight: true,
      slidesToShow: 1,
      slidesToScroll: 1
    },
    // Default options for text slider
    // Also inherits settings from slickOptions
    textSliderOptions: {
      slidesFile: 'TextSliderCards.csv',
      startingSlide: '',
      // Add slide IDs to this list to include them, or remove the whole thing to include everything.
      slideScope: [],
      overviewIsOpen: false,
      showBottomNav: true,
      maxIconsTall: 2,
      causeEffect: ['Causes', 'Effects']
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
      hide: { direction: 'down' },
      show: { direction: 'down' },
      speed: 500,
      location: 'bl' // Bottom Left. bl, br, tl, and tr are all ok.
    },
    // No options for chimes right now.
    ChimeOptions: {}
  };

  /***********************************************/
  // Get course external URL and related info.
  // Good for logging and grabbing scripts/images.
  /***********************************************/

  var courseAssetURL = getAssetURL(window.location.href, 'complete');
  logThatThing(courseAssetURL);

  // Are we in Studio? If so, stop trying to run anything. Just quit.
  var courseSite = getAssetURL(window.location.href, 'site');
  if (courseSite.indexOf('studio') > -1) {
    console.log('Running HXJS in studio is probably not great. Quitting.');
    return;
  }

  // Get our current location, mostly for logging purposes,
  // but also so we can load the scripts properly.
  var courseInfo = getCourseInfo(window.location.href);
  var courseLogID =
    courseInfo.institution + '.' + courseInfo.id + '_' + courseInfo.run;

  logThatThing({ 'HX.js': 'enabled' });
  logThatThing({ 'course log id': courseLogID });

  /**************************************/
  // Load outside scripts.
  // Must be in Files & Uploads.
  // Only do it if we need them.
  // Continue when done.
  /**************************************/

  // Define the function that gets the outside scripts.
  $.getMultiScripts = function(arr, path) {
    var _arr = $.map(arr, function(scr) {
      return $.getScript((path || '') + scr);
    });

    _arr.push(
      $.Deferred(function(deferred) {
        $(deferred.resolve);
      })
    );

    return $.when.apply($, _arr);
  };

  var scriptArray = [];

  // We definitely want to load the course-wide options file.
  // It overrides defaults in this file, and is overridden by local options.
  var hxOptions = {};
  scriptArray.push('hxGlobalOptions.js');

  // Do we load Prism for code highlighting?
  var codeblocks = $('code');
  if (codeblocks.length) {
    logThatThing({ code_block: 'found' });
    scriptArray.push('prism.js');
  }

  // Do we load Slick for image sliders?
  var slider = $('.hx-slider');
  var navslider = $('.hx-navslider');
  var bigslider = $('.hx-bigslider');
  if (slider.length || (navslider.length && bigslider.length)) {
    logThatThing({ image_slider: 'found' });
    scriptArray.push('slick.js');
  }

  // Do we load the Dynamic Text Slider?
  var dynamicSliders = $('.hx-dynamic-sliderbox');
  if (dynamicSliders.length) {
    logThatThing({ dynamic_slider: 'found' });
    var HXDTS;
    scriptArray.push('papaparse.js'); // CSV parser
    scriptArray.push('hx-text-slider.js');
  }

  // Do we load the Image Map Resizer?
  var theMaps = $('map');
  if (theMaps.length) {
    logThatThing({ image_map: 'found' });
    scriptArray.push('imageMapResizer.min.js');
  }

  // Do we load HXVideoLinks for... um... HarvardX video links?
  // And HXPopUpProblems for pop-up problems, and Chime for etc.
  // Set hxLocalOptions.dontLoadVideoStuff: true to avoid this,
  // for instance if you have several videos on one page that don't need it.
  var loadVideoStuff = true;
  if (typeof hxLocalOptions.dontLoadVideoStuff !== undefined) {
    if (hxLocalOptions.dontLoadVideoStuff === true) {
      loadVideoStuff = false;
      console.log('skipping loading video js');
    }
  }

  // We load the video scripts when...
  // - we're not specifically told not to
  // - and there's a video on the page
  // - and, for pop-up problems, there needs to be a timer.
  // - and, for the chimes, there needs to be that timer.
  var allVideos = $('.video');
  if (loadVideoStuff) {
    if (allVideos.length) {
      logThatThing({ video: 'found' });
      scriptArray.push('HXVideoLinks.js');
      var HXVL;
      // Only do pop-up problems if the right timer is in place.
      if (HXPUPTimer.length !== 0) {
        scriptArray.push('HXPopUpProblems.js');
        var HXPUP;
      }
      // Only do video chimes if the right timer is in place.
      if (HXChimeTimer.length !== 0) {
        scriptArray.push('HXVideoChime.js');
        var HXVC;
      }
    }
  }

  // This is where we load all the outside scripts we want.
  $.getMultiScripts(scriptArray, courseAssetURL)
    .done(function() {
      logThatThing({ 'Loaded scripts': scriptArray });
      if (hxGlobalOptions) {
        hxOptions = setDefaultOptions(
          hxLocalOptions,
          hxGlobalOptions,
          hxDefaultOptions
        );
      } else {
        hxOptions = setDefaultOptions(hxLocalOptions, {}, hxDefaultOptions);
      }
      keepGoing(hxOptions);
    })
    .fail(function(jqxhr, settings, exception) {
      console.log(jqxhr);
      console.log(settings);
      console.log(exception);
      logThatThing({ script_load_error: settings });
      hxOptions = setDefaultOptions(hxLocalOptions, {}, hxDefaultOptions);
      keepGoing(hxOptions);
    });

  // Once we have the options, we're ready to proceed.
  function keepGoing(hxOptions) {
    window.hxOptions = hxOptions;
    console.log('Window hxOptions set');
    // Keep track of what we have open/closed.
    // window.hxToggled = [];
    // window.hxToggleLast = [];

    /**************************************/
    // If we have videos, instantiate the functions
    // that handle pop-up links and problems.
    /**************************************/
    if (allVideos.length && loadVideoStuff) {
      $('head').append(
        $(
          '<link rel="stylesheet" href="' +
            courseAssetURL +
            'VideoLinks.css" type="text/css" />'
        )
      );
      HXVL = new HXVideoLinks(hxOptions.VidLinkOptions);

      // Only do pop-up problems if there's a timer in place.
      if (HXPUPTimer.length !== 0) {
        HXPUP = new HXPopUpProblems(hxDefaultOptions.PUPOptions, HXPUPTimer);
      }
      // Only do pop-up problems if there's a timer in place.
      if (HXChimeTimer.length !== 0) {
        HXVC = new HXVideoChime(hxDefaultOptions.ChimeOptions, HXChimeTimer);
      }
    }

    // If we have image maps, scale them.
    if (theMaps.length && hxOptions.resizeMaps) {
      $('map').imageMapResize();
    }

    // If we have code blocks, highlight them.
    if (codeblocks.length && hxOptions.highlightCode) {
      highlightCode();
    }

    /**************************************/
    // Jump to time in video on this page.
    // Make a link like <a href="#video1" data-time="mm:ss">link text</a>
    // The # is actually a pound sign for anchor link.
    // Set the number to which video you want. Top one is 1.
    /**************************************/

    let allTimeLinks = $('a.hx-vidtime');
    allTimeLinks.on('click tap', function() {
      let thisTime = hmsToTime($(this).attr('data-time'));
      let href = $(this).attr('href');
      let anchor = href.slice(href.indexOf('#video'));
      let vidNumber = anchor.replace('#video', '');
      let unitNumber = href.slice(
        href.indexOf('/jump_to_id/') + 13,
        href.indexOf('#video')
      );
      let startsWithHash = href.indexOf('#') === 0 ? true : false;

      // If the href starts with a pound sign, go on this page.
      if (startsWithHash) {
        logThatThing({ 'link starts video at time': thisTime });
        HXVL.jumpToTime(vidNumber, thisTime);
      }
      // If not, stash the destination in HTML5 Local Storage
      // so that we can retrieve it on the next page.
      else {
        localStorage.HXVideoLinkGo = 'true';
        localStorage.HXVideoLinkUnit = unitNumber;
        localStorage.HXVideoLinkNumber = vidNumber;
        localStorage.HXVideoLinkTime = thisTime;
        logThatThing({
          'storing video info for jump': {
            unit: unitNumber,
            'video number': vidNumber,
            time: thisTime
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
    if (hxOptions.collapsedNav) {
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
    if (hxOptions.makeSmiles) {
      // var smileLocation = $('.sequence-nav .nav-item.active').attr('data-id');
      let mehFace = $(
        '<span class="hx-smileystack hx-meh fa-stack fa-lg"><span class="fa fa-circle fa-stack-2x"></span><span class="fa fa-meh-o fa-stack-2x"></span></span>'
      );
      let smileFace = $(
        '<span class="hx-smileystack hx-smile fa-stack fa-lg"><span class="fa fa-circle fa-stack-2x"></span><span class="fa fa-smile-o fa-stack-2x"></span></span>'
      );
      let spacer = $('<span class="hx-smileyspacer"></span>');
      // Remove any existing elements, because the way edX loads pages calls javascript multiple times
      $('.hx-smileystack').remove();
      $('.hx-smileyspacer').remove();
      $('.sequence-bottom').prepend(spacer);
      $('.sequence-bottom').append(mehFace);
      $(mehFace).on('click tap', function() {
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
    let tintButton = $('#hx-tint');
    if (tintButton.length) {
      $(tintButton).on('click tap', function() {
        $('p').animate({ color: 'blue' });
      });
    }

    /**************************************/
    // Forum Tricks section. Right now, we only have:
    // Auto-open inline discussions
    /**************************************/
    if (hxOptions.openPageDiscussion) {
      $('.discussion-show.btn').click();
    }

    /**************************************/
    // External Links
    // Adds a FontAwesome icon for external links at the end of
    // each link that does not lead to an edx course.
    // Set hxLocalOptions.markExternalLinks = true to use.
    /**************************************/
    if (hxOptions.markExternalLinks) {
      logThatThing('marking external links');
      $('.vert .xblock a, .static_tab_wrapper .xblock a').each(function(
        i,
        linky
      ) {
        var destination = $(linky).attr('href');
        if (isExternalLink(destination)) {
          $(linky).append(
            ' <span class="fa fa-external-link"><span class="sr">External link</span></span>'
          );
        }
      });
    }

    /**************************************/
    // Stuff for a visibility toggle button.
    // Button classes start with "hx-togglebutton#"
    // Target classes start with "hx-toggletarget#"
    // (Where # is a number, not a pound sign.)
    /**************************************/
    let togglerClass = 'hx-togglebutton';
    let toggledClass = 'hx-toggletarget';
    prepAccessibleToggles(togglerClass, toggledClass);

    /**************************************/
    // Highlight toggle button.
    // Create a button with the class "highlighter#"
    // and spans with the class "highlight#"
    // where the # is a number.
    /**************************************/

    $('[class^=hx-highlighter]').on('click tap', function() {
      let myNumber = getClassNumber(this.className, 'hx-highlighter');

      if (hxOptions.highlightState) {
        $('.hx-highlight' + myNumber).css({
          'background-color': hxOptions.highlightColor,
          transition: 'background 0.2s'
        });
      } else {
        $('.hx-highlight' + myNumber).css({
          'background-color': hxOptions.highlightBackground,
          transition: 'background 0.2s'
        });
      }

      hxOptions.highlightState = !hxOptions.highlightState;

      logThatThing({
        'Highlight button': 'pressed',
        'Highlight number': myNumber
      });
    });

    // Automatic Table of Contents maker.
    if (hxOptions.makeTOC) {
      makeAutoTOC();
    }

    // Clickable images that pop up dialog boxes.
    let popUpOpener = $('.hx-popup-opener');
    if (popUpOpener.length) {
      handlePopUpContent();
    }

    // Auto-generation of footnotes.
    let allFootnotes = $('span[class^="hx-footnote"]');
    if (allFootnotes.length) {
      makeFootnotes(allFootnotes);
    }

    // If we have dynamic sliders, run them.
    if (dynamicSliders.length) {
      // Load CSS and instantiate JS
      $('head').append(
        $(
          '<link rel="stylesheet" href="' +
            courseAssetURL +
            'hx-text-slider.css" type="text/css" />'
        )
      );
      console.log(hxOptions.textSliderOptions);
      HXDTS = new HXTextSlider(hxOptions.textSliderOptions);
      logThatThing({ 'dynamic slider': 'created' });
    }

    /***********************************/
    // Stuff for the Slick image slider.
    /***********************************/

    // Only do slider things if there are actually sliders to create.
    // Would be good to handle multiple sliders later on.
    if (slider.length) {
      $('head').append(
        $(
          '<link rel="stylesheet" href="' +
            courseAssetURL +
            'slick.css" type="text/css" />'
        )
      );
      $('head').append(
        $(
          '<link rel="stylesheet" href="' +
            courseAssetURL +
            'slick-theme.css" type="text/css" />'
        )
      );
      slider.slick(hxOptions.slickOptions);
      logThatThing({ slider: 'created' });
    }

    // This set is for matched sliders, where one is the
    // thumbnails and one is the full-sized image and/or text.
    // Would be good to handle multiple pairs later on.
    if (navslider.length && bigslider.length) {
      $('head').append(
        $(
          '<link rel="stylesheet" href="' +
            courseAssetURL +
            'slick.css" type="text/css" />'
        )
      );
      $('head').append(
        $(
          '<link rel="stylesheet" href="' +
            courseAssetURL +
            'slick-theme.css" type="text/css" />'
        )
      );
      navslider.slick(hxOptions.slickNavOptions);
      bigslider.slick(hxOptions.slickBigOptions);
      logThatThing({ 'paired slider': 'created' });
    }

    // Placeholder: Audio player

    // Placeholder: Intro.js walkthroughs
    // Still trying to figure out how to place these properly.
  }

  /***********************************/
  // Various utility functions.
  /***********************************/

  /**************************************/
  // Stuff for a visibility toggle button.
  // One class of items toggles another,
  // with numbers setting the matching items.
  // Adds aria attribs for accessibility.
  /**************************************/
  function prepAccessibleToggles(press, target) {
    // Attach aria attributes to each button and
    // to each togglable element.
    // Also disable other buttons in a set when you press one.
    $('[class^=' + press + ']').each(function() {
      let myNumber = getClassNumber(this.className, press);
      $(this).attr('aria-controls', target + myNumber);

      if ($('.' + target + myNumber + ':visible').length > 0) {
        $(this).attr('aria-expanded', 'true');
        $('.' + target + myNumber).attr('aria-hidden', 'false');
      } else {
        $(this).attr('aria-expanded', 'false');
        $('.' + target + myNumber).attr('aria-hidden', 'true');
      }
    });

    // Slidetoggle the elements and reverse the aria attribs.
    $('[class^=' + press + ']').on('click tap', function() {
      let myNumber = getClassNumber(this.className, press);
      let vis = '';

      $('.' + target + myNumber).slideToggle('fast');

      if ($(this).attr('aria-expanded') === 'true') {
        vis = 'invisible';
        $('.' + press + myNumber).attr('aria-expanded', 'false');
        $('.' + target + myNumber).attr('aria-hidden', 'true');
        $('.hx-toggleset .' + press + myNumber)
          .siblings()
          .attr('disabled', false);
      } else {
        vis = 'visible';
        $('.' + press + myNumber).attr('aria-expanded', 'true');
        $('.' + target + myNumber).attr('aria-hidden', 'false');
        $('.hx-toggleset .' + press + myNumber)
          .siblings()
          .attr('disabled', true);
        // Scroll to single target if it's offscreen
        if ($('.' + target + myNumber).length === 1) {
          if (!isVisible($('.' + target + myNumber)[0])) {
            $('.' + target + myNumber)[0].scrollIntoView();
          }
        }
      }

      logThatThing({
        'Toggle button': 'pressed',
        'Toggled to': vis,
        'Toggle number': myNumber
      });
    });
  }

  /**************************************/
  // If we have code blocks on the page,
  // load the style sheet for them, and
  // make sure they recolor properly later.
  /**************************************/
  function highlightCode() {
    $('head').append(
      $(
        '<link rel="stylesheet" href="' +
          courseAssetURL +
          'prism.css" type="text/css" />'
      )
    );

    // If a student submits or resets a problem, we'll need to recolor the code.
    $('.submit, .reset').on('click tap', function() {
      // Recoloring function. Needs to remove observer temporarily,
      // or its brain will explode with all the mutations.
      var rehighlight = function(mutationsList) {
        for (var mutation of mutationsList) {
          if (mutation.type == 'childList') {
            $.when(observer.disconnect()).done(function() {
              $.when(Prism.highlightAllUnder(target)).done(function() {
                // Submitting or resetting results in a lot of changes.
                // Just wait half a second for them to go through.
                // It'll save us a lot of overhead.
                setTimeout(function() {
                  observer.observe(target, config);
                }, 500);
              });
            });
            break;
          }
        }
      };

      // After learners submit, watch the problem for mutations.
      // Once the mutations happen, recolor the code in that problem.
      let target = this.closest('.xblock');
      let config = { childList: true };
      let observer = new MutationObserver(rehighlight);
      observer.observe(target, config);
    });
  }

  /**************************************/
  // Automatic Table of Contents maker.
  // Uses h3 and h4 elements, links them up.
  // Set hxLocalOptions.makeTOC = true to use.
  /**************************************/
  function makeAutoTOC() {
    // Add the container for the TOC
    if ($('.edx-notes-wrapper-content').length) {
      $('.edx-notes-wrapper-content:first-of-type').prepend(
        '<div id="autoTOC" class="hx-autotoc"></div>'
      );
    } else {
      $($('#seq_content .vert .xblock')[0]).prepend(
        '<div id="autoTOC" class="hx-autotoc"></div>'
      );
    }
    // Using text instead of objects to make nesting easier.
    let autoTOC = '<h3>Table of Contents</h3><ul>';

    // Get all the h3 and h4 elements on the page.
    let allHeaders = $('h3, h4').filter(function() {
      // Remove anything that's hidden away.
      return $(this).is(':visible');
    });

    let TOCList = $('#autoTOC ul');

    // For each header, add it to the list and make a link.
    allHeaders.each(function(i) {
      // Set the id of the element to link to.
      $(this).attr('id', 'TOCLink' + i);

      let TOCEntry = $(this).text();
      let TOCLevel;
      if ($(this).is('h3')) {
        TOCLevel = 3;
        if ($(allHeaders[i - 1]).is('h3') || i === 0) {
          autoTOC +=
            '<li class="autotoc' +
            TOCLevel +
            '"><a href="#TOCLink' +
            i +
            '">' +
            TOCEntry +
            '</a></li>';
        } else if ($(allHeaders[i - 1]).is('h4')) {
          autoTOC +=
            '</ul></li><li class="autotoc' +
            TOCLevel +
            '"><a href="#TOCLink' +
            i +
            '">' +
            TOCEntry +
            '</a></li>';
        }
      }
      if ($(this).is('h4')) {
        TOCLevel = 4;
        if ($(allHeaders[i - 1]).is('h3')) {
          if (i > 0) {
            autoTOC.slice(0, autoTOC.length - 5);
          }
          autoTOC +=
            '<ul><li class="autotoc' +
            TOCLevel +
            '"><a href="#TOCLink' +
            i +
            '">' +
            TOCEntry +
            '</a></li>';
        } else if ($(allHeaders[i - 1]).is('h4')) {
          autoTOC +=
            '<li class="autotoc' +
            TOCLevel +
            '"><a href="#TOCLink' +
            i +
            '">' +
            TOCEntry +
            '</a></li>';
        }
      }
    });
    autoTOC += '</ul>';

    $('#autoTOC').append(autoTOC);
  }

  /***********************************/
  // Auto-generation of footnotes.
  // Finds <span class="hx-footnote#">[#]</span>
  // Links to <div class="hx-footnote-target#">
  // Does some rearranging and formatting.
  // Must have HTML component with h3 header "Footnotes"
  /***********************************/
  function makeFootnotes(allFootnotes) {
    let thisFootnote,
      thisNumber,
      thisTarget,
      footnoteComponents,
      destinationComponent;

    for (let i = 0; i < allFootnotes.length; i++) {
      thisFootnote = allFootnotes[i];
      thisNumber = getClassNumber(thisFootnote.className, 'hx-footnote');
      thisTarget = $('div.hx-footnote-target' + thisNumber);

      // Style the footnote marker
      $(thisFootnote).addClass('hx-footnote-style');
      $(thisFootnote).wrap('<sup></sup>');

      // Move the footnote target divs to the appropriate location
      footnoteComponents = $('h3:contains("Footnote")');
      destinationComponent = $(
        footnoteComponents[footnoteComponents.length - 1]
      ).parent();
      $(thisTarget)
        .detach()
        .appendTo(destinationComponent);

      // Add links to the footnote markers
      $(thisFootnote)
        .wrap(
          '<a href="#hxfoot' +
            thisNumber +
            '" name="hxfootback' +
            thisNumber +
            '"></a>'
        )
        .wrap();

      // Add targets and back-links to the footnotes
      thisTarget.prepend('<a name="hxfoot' + thisNumber + '"></a>');
      thisTarget.append(
        '<p><a href="#hxfootback' + thisNumber + '">(back)</a></p>'
      );
    }
  }

  /*******************************************/
  // Clickable images that pop up dialog boxes.
  // Clickable area has id "MyID" and class "hx-popup-opener"
  // Target div has class "MyID hx-popup-content"
  // Don't put other classes first, but you can put them later if you want.
  /*******************************************/
  function handlePopUpContent() {
    // First, create lists of areas for the purpose of accessibility.
    $('map').each(function(index) {
      // Make a list element from each area's title
      let tempList = [];
      $(this)
        .find('area')
        .each(function(index) {
          tempList.push(
            '<li class="' +
              this.className.split(/\s+/)[0] +
              ' hx-popup-opener" title="' +
              this.title +
              '"><a href="javascript:;">' +
              this.title +
              '</a></li>'
          );
        });

      // Make that list into a big string and wrap it with UL
      let listHTML = '<ul>' + tempList.join('') + '</ul>';
      listHTML = '<h4>Clickable Areas:</h4>' + listHTML;

      // If we're going to make a list by hand, do nothing.
      let listSwitch = $(this).data('make-accessible-list');
      if (listSwitch === 'false' || listSwitch === false) {
        //do nothing
      } else {
        // Otherwise, append the list right after the map.
        $(this).after(listHTML);
      }
    });

    // Get the list of popup openers again so we can bind properly.
    let newPops = $('.hx-popup-opener');

    // Create the dialogue if we click on the right areas or links.
    newPops.on('click tap', function() {
      let myClass = this.className;
      let boxName = myClass.split(/\s+/)[0];

      $('div.' + boxName).dialog(
        {
          dialogClass: 'hx-popup-dialog',
          title: $(this).attr('title'),
          show: {
            effect: 'fade',
            duration: 200
          },
          hide: {
            effect: 'fade',
            duration: 100
          },
          buttons: {
            Close: function() {
              $(this).dialog('close');
            }
          }
        },
        function(boxName) {
          $('div.' + boxName).css({ display: '' });
          alert(boxName);
        }
      );

      logThatThing({
        'Pop-up Dialog': 'opened',
        Dialog: boxName
      });
    });
  }

  // Pops up data-based maps that are colored with map_data.js
  function popDataMap() {
    console.log('Open full-sized map image.');
    let mf = $('#mapframe');
    let zoombutton = mf.contents().find('#LargeMapView');
    mf.toggleClass('hx-svg-view');
    if (mf.hasClass('hx-svg-view')) {
      zoombutton.text('View Regular');
    } else {
      zoombutton.text('View Large');
    }
  }

  // Is a link external or not?
  function isExternalLink(url) {
    if (typeof url === 'undefined') {
      return false;
    } else {
      if (
        url.includes('edx.org') ||
        url.includes('edxapp') ||
        url.includes('edx-cdn.org') ||
        url.includes('/courses/') ||
        url.includes('jump_to_id') ||
        url.includes('cloudfront.net') ||
        url.includes('mailto') ||
        url.includes('javascript:void') ||
        url.includes('javascript:;') ||
        url.slice(0, 1) == '#'
      ) {
        return false;
      }
      return true;
    }
  }

  // Turns a page URL in edX into an external asset url,
  // because we can't use /static/ from within javascript.
  // Pass option 'complete' for the whole thing, 'site' for the site,
  // or 'partial' for without the site.
  // Public function.
  function getAssetURL(windowURL, option) {
    // Sometimes escape characters are not our friends.
    windowURL = windowURL.replace('%2B', '+');
    windowURL = windowURL.replace('%3A', ':');

    // Match the site in case we need it for something later.
    let courseSiteURL = windowURL.match(/https:\/\/.+\//)[0];

    if (option == 'site') {
      return courseSiteURL;
    }

    // Switch from course to asset
    let staticFolderURL = windowURL.replace('courses/course', 'asset');

    // In case we're rendering in XBlock URL mode:
    if (staticFolderURL.search('xblock/block-v1') > -1) {
      staticFolderURL = staticFolderURL.replace('xblock/block', 'asset');
      staticFolderURL = staticFolderURL.replace('+type@', '/');
    }

    // Ditch the unique identifier for this resource.
    let pluslocation = staticFolderURL.indexOf('+');
    let finalLocation = staticFolderURL.indexOf('/', pluslocation);
    staticFolderURL = staticFolderURL.slice(0, finalLocation);

    // Switch from courseware to type
    staticFolderURL = staticFolderURL + '+type@asset+block/';

    if (option == 'partial') {
      return staticFolderURL.replace(courseSiteURL, '');
    }

    return staticFolderURL;
  }

  // Gets the institution, course ID, and course run from the URL.
  function getCourseInfo(windowURL) {
    let partialURL = getAssetURL(windowURL, 'partial');
    let courseInfo = {};

    // get the part from the colon to the first +
    partialURL = partialURL.split(':')[2];
    courseInfo.institution = partialURL.split('+')[0];
    courseInfo.id = partialURL.split('+')[1];
    courseInfo.run = partialURL.split('+')[2];

    return courseInfo;
  }

  // Takes in all the classes, as from a className function.
  // Returns the number attached to the important class.
  function getClassNumber(className, importantClass) {
    let allClasses = className.split(/\s+/);
    for (let i = 0; i < allClasses.length; i++) {
      if (allClasses[i].indexOf(importantClass) === 0) {
        return allClasses[i].slice(importantClass.length);
      }
    }
    return -1;
  }

  // Sets the default options for something if they're not already defined.
  // Prioritizes local options, then global options in /static/, then the ones in this file.
  // Does deep copy (clone)
  function setDefaultOptions(localOptions, globalOptions, fallbackOptions) {
    let tempOptions = {};

    if (!localOptions && !globalOptions) {
      return fallbackOptions;
    } else if (!localOptions) {
      tempOptions = $.extend(true, {}, fallbackOptions, globalOptions);
    } else if (!globalOptions) {
      tempOptions = $.extend(true, {}, fallbackOptions, localOptions);
    } else {
      tempOptions = $.extend(
        true,
        {},
        fallbackOptions,
        globalOptions,
        localOptions
      );
    }

    return tempOptions;
  }

  // Konami Code
  (function($) {
    $.fn.hxKonami = function(callback, code) {
      if (code === undefined) code = '38,38,40,40,37,39,37,39,66,65';

      return this.each(function() {
        let kkeys = [];
        $(this).keydown(function(e) {
          kkeys.push(e.keyCode);
          while (kkeys.length > code.split(',').length) {
            kkeys.shift();
          }
          if (kkeys.toString().indexOf(code) >= 0) {
            kkeys = [];
            callback(e);
          }
        });
      });
    };
  })(jQuery);

  $(window).hxKonami(function() {
    alert('+30 Lives');
    logThatThing({ 'easter egg': 'Konami Code' });
  });

  // Converts hh:mm:ss to a number of seconds for time-based problems.
  // If it's passed a number, it just spits that back out as seconds.
  // Public function.
  function hmsToTime(hms) {
    hms = hms.toString();

    let hmsArray = hms.split(':');
    let time = 0;

    if (hmsArray.length == 3) {
      time =
        3600 * parseInt(hmsArray[0]) +
        60 * parseInt(hmsArray[1]) +
        Number(hmsArray[2]);
    } else if (hmsArray.length == 2) {
      time = 60 * parseInt(hmsArray[0]) + Number(hmsArray[1]);
    } else if (hmsArray.length == 1) {
      time = Number(hmsArray[0]);
    }

    return time;
  }

  // Converts time in seconds to hh:mm:ss format.
  // Will use just mm:ss if no hours.
  // Public function.
  function timeToHMS(time) {
    var hours;
    var minutes;
    var seconds;
    var timestring = '';

    time = Math.floor(time);
    hours = Math.floor(time / 3600);
    minutes = Math.floor((time / 60) % 60);
    seconds = Math.floor(time % 60);

    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    timestring = '0:' + seconds;
    if (minutes > 0) {
      timestring = minutes + ':' + seconds;
    }
    if (hours > 0) {
      timestring = hours + ':' + minutes + ':' + seconds;
    }

    return timestring;
  }

  // Checks to see if an element is on-screen.
  function isVisible(elm) {
    var rect = elm.getBoundingClientRect();
    var viewHeight = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight
    );
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
  }

  // Send logs both to the console and to the official edX logamajig.
  function logThatThing(ThatThing) {
    console.log(JSON.stringify(ThatThing));
    Logger.log(courseLogID + '.hxjs', ThatThing);
  }

  // Let's publish a few of these.
  window.getAssetURL = getAssetURL;
  window.hmsToTime = hmsToTime;
  window.timeToHMS = timeToHMS;
  window.logThatThing = logThatThing;
  window.prepAccessibleToggles = prepAccessibleToggles;
  window.isExternalLink = isExternalLink;
  window.popDataMap = popDataMap;
};

$(document).ready(function() {
  HXGlobalJS(hxLocalOptions, HXPUPTimer, HXChimeTimer);
});
