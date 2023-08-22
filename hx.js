var HXGlobalJS = function () {
  'use strict';

  // Checking for some local variables. If they're not defined, make blanks.
  if (typeof window.hxLocalOptions === 'undefined') {
    window.hxLocalOptions = {};
  }
  if (typeof window.HXPUPTimer === 'undefined') {
    window.HXPUPTimer = [];
  }
  if (typeof window.HXChimeTimer === 'undefined') {
    window.HXChimeTimer = [];
  }

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

    // Auto-open the on-page discussions.
    openPageDiscussion: false,

    // Resize image maps when an image shrinks because of screen size
    resizeMaps: true,

    // Marks all external links with an icon.
    markExternalLinks: false,

    // Use learner backpack to store & retrieve data?
    useBackpack: true,

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
      slidesToScroll: 3,
    },
    // Default options for image slider navigation
    slickNavOptions: {
      asNavFor: '.hx-bigslider',
      variableWidth: true,
      focusOnSelect: true,
      slidesToShow: 3,
      slidesToScroll: 1,
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
      slidesToScroll: 1,
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
      causeEffect: ['Causes', 'Effects'],
    },
    // Default options for pop-up problems
    PUPOptions: {
      width: 800,
      effect: 'fade',
      effectlength: 200,
      myPosition: 'center',
      atPosition: 'center',
      ofTarget: window,
    },
    // Default options for video links
    VidLinkOptions: {
      hideLinkAfter: 5, //seconds
      effect: 'slide',
      hide: { direction: 'down' },
      show: { direction: 'down' },
      speed: 500,
      location: 'bl', // Bottom Left. bl, br, tl, and tr are all ok.
    },
    // Default options for Summernote toolbar
    HXEditorOptions: [
      ['style', ['style']],
      ['font', ['bold', 'italic', 'underline', 'clear']],
      ['color', ['color']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['table', ['table']],
      ['insert', ['link']],
      ['view', ['fullscreen', 'codeview', 'help']],
    ],
    // No options for chimes right now.
    ChimeOptions: {},
  };

  /***********************************************/
  // Get course external URL and related info.
  // Good for logging and grabbing scripts/images.
  /***********************************************/

  console.debug("Testing to see whether we've reloaded. 11:06 PM.")

  var course_asset_url = getAssetURL(window.location.href, 'complete');
  // Get the URL of this script, because not everything is in Files & Uploads.
  var script_asset_url = course_asset_url;
  let hx_js_script_tag = $('script')
    .filter(function () {
      if (typeof this.attributes.src !== 'undefined') {
        return this.attributes['src'].value.includes('hx.js');
      }
    })[0]
    .attributes.src.value.replace('hx.js', '');
  if (hx_js_script_tag.length === 1) {
    script_asset_url = hx_js_script_tag.src;
  }
  logThatThing(script_asset_url);

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

  // Listen for events that rewrite problem HTML.
  Logger.listen('problem_check', null, (en, es) => onProblemRewrite(en, es));
  Logger.listen('problem_show', null, (en, es) => onProblemRewrite(en, es));
  Logger.listen('problem_reset', null, (en, es) => onProblemRewrite(en, es));

  /**************************************/
  // Load outside scripts.
  // Must be in Files & Uploads.
  // Only do it if we need them.
  // Continue when done.
  /**************************************/

  // Define the function that gets the outside scripts.
  $.getMultiScripts = function (arr, path) {
    var _arr = $.map(arr, function (scr) {
      return $.getScript((path || '') + scr);
    });

    _arr.push(
      $.Deferred(function (deferred) {
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

  // Do we load the Summernote editor?
  var editors = $('.hx-editor:visible');
  if (editors.length > 0) {
    logThatThing({ editor: 'found' });
    scriptArray.push('summernote-lite.min.js');
    scriptArray.push('HXEditor.js');
    var HXED;
  }

  // Do we load HXVideoLinks for... um... HarvardX video links?
  // And HXPopUpProblems for pop-up problems, and Chime for etc.
  // Set hxLocalOptions.dontLoadVideoStuff: true to avoid this,
  // for instance if you have several videos on one page that don't need it.
  var loadVideoStuff = true;
  if (typeof window.hxLocalOptions.dontLoadVideoStuff !== undefined) {
    if (window.hxLocalOptions.dontLoadVideoStuff === true) {
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
    if (allVideos.length > 0) {
      logThatThing({ video: 'found' });
      scriptArray.push('HXVideoLinks.js');
      var HXVL;
      // Only do pop-up problems if the right timer is in place.
      if (window.HXPUPTimer.length > 0) {
        scriptArray.push('HXPopUpProblems.js');
        var HXPUP;
      }
      // Only do video chimes if the right timer is in place.
      if (window.HXChimeTimer.length > 0) {
        scriptArray.push('HXVideoChime.js');
        var HXVC;
      }
    }
  }

  // This is where we load all the outside scripts we want.
  $.getMultiScripts(scriptArray, script_asset_url)
    .done(function () {
      logThatThing({ 'Loaded scripts': scriptArray });
      if (hxGlobalOptions) {
        hxOptions = setDefaultOptions(
          window.hxLocalOptions,
          hxGlobalOptions,
          hxDefaultOptions
        );
      } else {
        hxOptions = setDefaultOptions(
          window.hxLocalOptions,
          {},
          hxDefaultOptions
        );
      }
      keepGoing(hxOptions);
    })
    .fail(function (jqxhr, settings, exception) {
      console.log(jqxhr);
      console.log(settings);
      console.log(exception);
      logThatThing({ script_load_error: settings });
      hxOptions = setDefaultOptions(
        window.hxLocalOptions,
        {},
        hxDefaultOptions
      );
      keepGoing(hxOptions);
    });

  // Once we have the options, we're ready to proceed.
  function keepGoing(hxOptions) {
    window.hxOptions = hxOptions;
    console.log('Window hxOptions set');

    /**************************************/
    // The "backpack" stores up to 100k of
    // learner data on edX's server.
    // See https://github.com/HarvardX/js-input-samples/tree/master/learner_backpack
    /**************************************/
    if ($('#hxbackpackframe').length === 0 && hxOptions.useBackpack) {
      // Add the backpack iframe and hide it.
      let server_url = getAssetURL(window.location.href, 'site');
      let backpackURL =
        server_url +
        'block-v1:' +
        courseInfo.institution +
        '+' +
        courseInfo.id +
        '+' +
        courseInfo.run +
        '+type@problem+block@' +
        'backpack';
      let bakframe = $('<iframe></iframe>');
      bakframe.attr('src', backpackURL);
      bakframe.attr('id', 'hxbackpackframe');
      bakframe.attr('aria-hidden', 'true');
      bakframe.attr('tabindex', '-1');
      bakframe.css('display', 'none');
      $('body').append(bakframe);

      // See later for the function that listens for the frame to load.
    }

    /**************************************/
    // Load css for the editor and insert a "Loading" note.
    // Set data-saveslot attrib to select save slot.
    /**************************************/
    if (editors.length) {
      $('head').append(
        $(
          '<link rel="stylesheet" href="' +
          script_asset_url +
            'summernote-lite.min.css" type="text/css" />'
        )
      );
      // Insert a loading indicator.
      let edit_box = $(
        '<div class="hx-loading-indicator"> Editor loading...</div>'
      );
      let spinner = $('<span class="fa fa-spinner fa-pulse"></span>');
      edit_box.prepend(spinner);
      editors.append(edit_box);
      // If the backpack is in place, start the editors.
      // Otherwise, this will get fired once the backpack loads.
      if (hxBackpackLoaded && typeof HXED === 'undefined') {
        HXED = new HXEditor(hxOptions.useBackpack, hxOptions.HXEditorOptions);
      } else {
        console.log('Backpack: ' + hxBackpackLoaded);
        console.log(
          'HXED: ' + typeof HXED === 'undefined' ? 'undefined' : 'ok'
        );
      }
    }

    /**************************************/
    // If we have videos, instantiate the functions
    // that handle pop-up links and problems.
    /**************************************/
    if (allVideos.length > 0 && loadVideoStuff) {
      $('head').append(
        $(
          '<link rel="stylesheet" href="' +
          script_asset_url +
            'VideoLinks.css" type="text/css" />'
        )
      );
      HXVL = new HXVideoLinks(hxOptions.VidLinkOptions);

      // Check for jump-to-time links and enable them.
      $('.jumptime').on('click tap', function (e) {
        // Suppress the effect of clicking the link.
        e.preventDefault();
        // If there's a data-for-vidnum attribute, select that video.
        // Otherwise, just use the first one on the page.
        let vnum = 1;
        if ($(this).attr('data-for-vidnum') !== undefined) {
          vnum = $(this).attr('data-for-vidnum');
        }
        // let v = $('.video')[vnum - 1];
        // Move that video to the time indicated in the data attribute.
        let t = hmsToTime($(this).attr('href'));
        jumpToTime(vnum, t);
      });

      // Only do pop-up problems if there's a timer in place.
      if (window.HXPUPTimer.length !== 0) {
        HXPUP = new HXPopUpProblems(
          hxDefaultOptions.PUPOptions,
          window.HXPUPTimer
        );
      }
      // Only do pop-up problems if there's a timer in place.
      if (window.HXChimeTimer.length !== 0) {
        HXVC = new HXVideoChime(
          hxDefaultOptions.ChimeOptions,
          window.HXChimeTimer
        );
      }
    }

    // If we have image maps, scale them.
    if (theMaps.length && hxOptions.resizeMaps) {
      $('map').imageMapResize();
    }

    // If we have code blocks, highlight them.
    if (codeblocks.length && hxOptions.highlightCode) {
      insertCodeHighlighter();
    }

    // If we have links or iframes to surveys with the hx-survey-url class on this page,
    // adjust their URLs to include course info.
    const elements_to_update = Array.from(
      document.getElementsByClassName('hx-survey-url')
    );
    if (elements_to_update.length) {
      logThatThing({ hx_surveys: 'found' });
      const elements_to_update = Array.from(
        document.getElementsByClassName('hx-survey-url')
      );
      const old_urls = elements_to_update.map(function (e) {
        if (e.tagName.toLowerCase() === 'a') {
          return e.href;
        } else if (e.tagName.toLowerCase() === 'iframe') {
          return e.src;
        } else {
          return e.innerText;
        }
      });
      const new_urls = old_urls.map(
        (x) =>
          x +
          '&university=' +
          courseInfo.institution +
          '&course_id=' +
          courseInfo.id +
          '&course_run=' +
          courseInfo.run
      );
      elements_to_update.forEach(function (e, i) {
        if (e.tagName.toLowerCase() === 'a') {
          e.href = new_urls[i];
        } else if (e.tagName.toLowerCase() === 'iframe') {
          e.src = new_urls[i];
        } else {
          e.innerText = new_urls[i];
        }
      });
    }

    /**************************************/
    // Jump to time in video on this page.
    // Make a link like <a href="#video1" data-time="mm:ss">link text</a>
    // The # is actually a pound sign for anchor link.
    // Set the number to which video you want. Top one is 1.
    /**************************************/

    let allTimeLinks = $('a.hx-vidtime');
    allTimeLinks.on('click tap', function () {
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
            time: thisTime,
          },
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
    // Make a color picker that lightly tints the page
    // for people with dyslexia.
    // Still a work in progress.
    /**************************************/
    let tintButton = $('#hx-tint');
    if (tintButton.length) {
      $(tintButton).on('click tap', function () {
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
      $('.vert .xblock a, .static_tab_wrapper .xblock a').each(function (
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
    let toggleRemember = 'hx-toggleremember';
    prepAccessibleToggles(togglerClass, toggledClass, toggleRemember);

    /**************************************/
    // Highlight toggle button.
    // Create a button with the class "highlighter#"
    // and spans with the class "highlight#"
    // where the # is a number.
    /**************************************/

    $('[class^=hx-highlighter]').on('click tap', function () {
      let myNumber = getClassNumber(this.className, 'hx-highlighter');

      if (hxOptions.highlightState) {
        $('.hx-highlight' + myNumber).css({
          'background-color': hxOptions.highlightColor,
          transition: 'background 0.2s',
        });
      } else {
        $('.hx-highlight' + myNumber).css({
          'background-color': hxOptions.highlightBackground,
          transition: 'background 0.2s',
        });
      }

      hxOptions.highlightState = !hxOptions.highlightState;

      logThatThing({
        'Highlight button': 'pressed',
        'Highlight number': myNumber,
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
          script_asset_url +
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
          script_asset_url +
            'slick.css" type="text/css" />'
        )
      );
      $('head').append(
        $(
          '<link rel="stylesheet" href="' +
          script_asset_url +
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
          script_asset_url +
            'slick.css" type="text/css" />'
        )
      );
      $('head').append(
        $(
          '<link rel="stylesheet" href="' +
          script_asset_url +
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
  // When an event resets a problem,
  // reapply certain javascript functions.
  /**************************************/
  let reapply_list = [''];
  function onProblemRewrite(event_name, event_source) {
    console.log(event_name, event_source);
    let prob_id;
    if (event_name === 'problem_check') {
      prob_id = event_source.split('_')[1];
    } else if (event_name === 'problem_show') {
      prob_id = event_source.problem.split('@')[2];
    }
    let problem = $('[id^="' + prob_id + '"]').parent()[0];

    // Wait a moment for the problem to reload.
    // Not the best solution, but events fire before DOM changes complete.
    setTimeout(function () {
      // Set the visibility of the toggle buttons.
      setVisFromMemory('hx-togglebutton', 'hx-toggletarget');
      // Re-highlight all the code.
      if (codeblocks.length && hxOptions.highlightCode) {
        Prism.highlightAllUnder(problem);
      }
    }, 500);
  }

  /**************************************/
  // Stuff for a visibility toggle button.
  // One class of items toggles another,
  // with numbers setting the matching items.
  // Adds aria attribs for accessibility.
  /**************************************/
  function getTogVisibility(location) {
    location = 'toggle_' + location;
    let should_show = false;
    try {
      // console.log(localStorage.HXToggleMemory);
      should_show = JSON.parse(localStorage.HXToggleMemory)[location];
    } catch (error) {
      // console.log('error');
      // console.log(error);
    }
    // console.log('visibility for toggle ' + location + ' is ' + ret);
    return should_show;
  }

  function setTogMemory(location, shown) {
    location = 'toggle_' + location;
    console.log('set vis of ' + location + ' to ' + shown);
    try {
      let hxtm = JSON.parse(localStorage.HXToggleMemory);
      hxtm[location] = shown;
      localStorage.HXToggleMemory = JSON.stringify(hxtm);
    } catch (error) {
      console.log('error');
      console.log(error);
      localStorage.HXToggleMemory = JSON.stringify({ [location]: shown });
    }
  }

  function hideThings(press, target, remember, num) {
    console.log('hiding');
    if ($.ui) {
      $('.' + target + num).hide('slide', { direction: 'up' }, 'fast');
    } else {
      // edX tabs don't load jQuery UI.
      $('.' + target + num).hide();
    }
    $('.' + press + num).attr('aria-expanded', 'false');
    $('.' + target + num).attr('aria-hidden', 'true');
    $('.hx-toggleset .' + press + num)
      .siblings()
      .attr('disabled', false);
    if (remember) {
      setTogMemory(num, false);
    }
  }

  function showThings(press, target, remember, num) {
    console.log('showing');
    if ($.ui) {
      $('.' + target + num).show('slide', { direction: 'up' }, 'fast');
    } else {
      // edX tabs don't load jQuery UI.
      $('.' + target + num).show();
    }
    $('.' + press + num).attr('aria-expanded', 'true');
    $('.' + target + num).attr('aria-hidden', 'false');
    $('.hx-toggleset .' + press + num)
      .siblings()
      .attr('disabled', true);
    if (remember) {
      setTogMemory(num, true);
    }
  }

  // Use toggle memeory to set visibility of toggleable elements.
  function setVisFromMemory(press, target) {
    console.log('setting visibility from memory');
    let prepped = [];
    $('[class*=' + target + ']').each(function () {
      let myNumber = getClassNumber(this.className, target);
      console.log('toggle ' + myNumber + '...');
      if (prepped.indexOf(myNumber) === -1) {
        prepped.push(myNumber);
        // console.log('...is not handled yet...');
        let should_be_visible = getTogVisibility(myNumber);
        if (should_be_visible !== undefined && should_be_visible !== null) {
          if (should_be_visible) {
            console.log('...should be shown. Showing it.');
            showThings(press, target, false, myNumber);
          } else {
            console.log('...should be hidden. Hiding it.');
            hideThings(press, target, false, myNumber);
          }
        }
      } else {
        console.log('...is already handled.');
      }
    });
  }

  // Gets toggleable items ready for use.
  function prepAccessibleToggles(press, target, remember_class) {
    // Add listeners and hide what should be hidden.
    // But don't prep the same toggles twice.
    let prepped = [];

    $('[class*=' + press + ']').each(function () {
      let myNumber = getClassNumber(this.className, press);
      if (prepped.indexOf(myNumber) === -1) {
        console.log('prepping toggle ' + myNumber);
        prepped.push(myNumber);

        // Add aria attributes to each toggler and target
        if ($('.' + target + myNumber + ':visible').length > 0) {
          $('.' + press + myNumber).attr('aria-expanded', 'true');
          $('.' + target + myNumber).attr('aria-hidden', 'false');
        } else {
          $('.' + press + myNumber).attr('aria-expanded', 'false');
          $('.' + target + myNumber).attr('aria-hidden', 'true');
        }
      }
    });
    setVisFromMemory(press, target);

    // Listener: clear the memory.
    $('.hx-clearmemory').on('click tap', function () {
      let myNumber = getClassNumber(this.className, press);
      // If hx-clearmemory has a number after it, clear that one item.
      // Otherwise, clear everything.
      if (myNumber !== null) {
        setTogMemory(myNumber, undefined);
      } else {
        localStorage.HXToggleMemory = '';
      }
    });

    // Listener: toggle elements when clicked
    // and reverse the aria attributes.
    $('[class*=' + press + ']').on('click tap', function () {
      let myNumber = getClassNumber(this.className, press);
      let remember = $(this).hasClass(remember_class);
      let vis = '';

      if ($(this).attr('aria-expanded') === 'true') {
        vis = 'invisible';
        hideThings(press, target, remember, myNumber, $(document));
      } else {
        vis = 'visible';
        showThings(press, target, remember, myNumber, $(document));
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
        'Toggle number': myNumber,
      });
    });
  }

  /**************************************/
  // If we have code blocks on the page,
  // load the style sheet for them.
  /**************************************/
  function insertCodeHighlighter() {
    $('head').append(
      $(
        '<link rel="stylesheet" href="' +
        script_asset_url +
          'prism.css" type="text/css" />'
      )
    );
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
    let allHeaders = $('h3, h4').filter(function () {
      // Remove anything that's hidden away.
      return $(this).is(':visible');
    });

    let TOCList = $('#autoTOC ul');

    // For each header, add it to the list and make a link.
    allHeaders.each(function (i) {
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
      $(thisTarget).detach().appendTo(destinationComponent);

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
    $('map').each(function (index) {
      // Make a list element from each area's title
      let tempList = [];
      $(this)
        .find('area')
        .each(function (index) {
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
    newPops.on('click tap', function (e) {
      let myClass = this.className;
      let boxName = myClass.split(/\s+/)[0];

      $('div.' + boxName).dialog(
        {
          dialogClass: 'hx-popup-dialog',
          title: $(this).attr('title'),
          position: {
            my: 'center',
            at: 'center',
            of: $(e.target),
          },
          show: {
            effect: 'fade',
            duration: 200,
          },
          hide: {
            effect: 'fade',
            duration: 100,
          },
          buttons: {
            Close: function () {
              $(this).dialog('close');
            },
          },
        },
        function (boxName) {
          $('div.' + boxName).css({ display: '' });
          alert(boxName);
        }
      );

      logThatThing({
        'Pop-up Dialog': 'opened',
        Dialog: boxName,
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
    } else if (!isNaN(hmsToTime(url))) {
      return false;
    } else {
      if (
        url.includes('edx.org') ||
        url.includes('edxapp') ||
        url.includes('edx-cdn.org') ||
        url.includes('edx-video.net') ||
        url.includes('/courses/') ||
        url.includes('/assets/courseware/') ||
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
    // Replace + and : if they're present.
    if (windowURL.includes('%2B')) {
      windowURL = windowURL.replace('%2B', '+');
    }
    if (windowURL.includes('%3A')) {
      windowURL = windowURL.replace('%3A', ':');
    }

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

  // Takes in all the classes, as from a className attribute.
  // Returns the number attached to the important class.
  function getClassNumber(className, importantClass) {
    let allClasses = className.split(/\s+/);
    for (let i = 0; i < allClasses.length; i++) {
      if (allClasses[i].indexOf(importantClass) === 0) {
        return allClasses[i].slice(importantClass.length);
      }
    }
    return null;
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
  (function ($) {
    $.fn.hxKonami = function (callback, code) {
      if (code === undefined) code = '38,38,40,40,37,39,37,39,66,65';

      return this.each(function () {
        let kkeys = [];
        $(this).keydown(function (e) {
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

  $(window).hxKonami(function () {
    alert('+30 Lives');
    logThatThing({ 'easter egg': 'Konami Code' });
  });

  // Learner Backpack utility function!
  // Did the backpack load properly? Listen for the load event.
  // Verify origin and publish functions.
  $(window)
    .off('message.hx')
    .on('message.hx', function (e) {
      var data = e.originalEvent.data;

      // Only accept from same origin. Won't work in Studio.
      if (e.originalEvent.origin !== location.origin) {
        return;
      }

      // Only accept objects with the right form.
      if (typeof data === 'string') {
        if (data === 'backpack_ready') {
          console.log('Backpack ready.');
          let iframe_window = $('#hxbackpackframe')[0].contentWindow;
          window.hxSetData = iframe_window.hxSetData;
          window.hxClearData = iframe_window.hxSetData;
          window.hxGetData = iframe_window.hxGetData;
          window.hxGetAllData = iframe_window.hxGetAllData;
          window.hxBackpackLoaded = iframe_window.hxBackpackLoaded;
          // If we're using editors on this page, load them.
          if (
            hxOptions.useBackpack &&
            editors.length > 0 &&
            typeof HXED === 'undefined'
          ) {
            HXED = new HXEditor(
              hxOptions.useBackpack,
              hxOptions.HXEditorOptions
            );
          }
        }
      }
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

  // Jump to a particular time in a given video.
  // Public function.
  function jumpToTime(vidnumber, seconds) {
    let thisVideo = $('.video')[vidnumber - 1];
    let state = $(thisVideo).data('video-player-state');
    if (typeof state.videoPlayer !== 'undefined') {
      console.log('jumping video ' + vidnumber + ' to time ' + seconds);
      thisVideo.scrollIntoView();
      state.videoPlayer.player.seekTo(seconds);
    } else {
      console.log('video ' + vidnumber + ' not ready');
    }
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
  window.jumpToTime = jumpToTime;
  window.hxBackpackLoaded = $('#hxbackpackframe').length > 0; // Gets set when backpack loads.
};

$(document).ready(function () {
  // If we're already running, don't run again.
  if (typeof window.hxjs_is_already_running !== 'undefined') {
    console.log('hx-js is already loaded, skipping this copy.');
    return;
  }
  window.hxjs_is_already_running = true;

  HXGlobalJS();
});
