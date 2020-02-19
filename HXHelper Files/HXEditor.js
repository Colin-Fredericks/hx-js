// This is designed to be called by hx.js
// It uses the Summernote editor.

var HXEditor = function(useBackpack, toolbarOptions) {
  var editors = $('.hx-editor');
  var backpack_ready = false;

  logThatThing('HX Editor starting');

  // Read the save slot from the data-saveslot attribute.
  var editor_save_slots = Object.keys($('div')).map(function(k, i) {
    try {
      return $('div')[k].attributes['data-saveslot'];
    } catch (err) {
      return '';
    }
  });

  // Insert a loading indicator.
  let editbox = $('<div class="editorbox"> Loading...</div>');
  let spinner = $('<span class="fa fa-spinner fa-pulse"></span>');
  editbox.prepend(spinner);
  editors.append(editbox);

  // Wait for summernote to load.
  // It's in an external javascript file loaded by hx-js.
  var timercount = 0;
  var timedelay = 250; // miliseconds
  var loadLoop = setInterval(function() {
    timercount += timedelay;

    // If it doesn't load after 7 seconds,
    // kill the indicator and inform the learner.
    if (timercount > 7000) {
      editbox.empty();
      editbox.append(
        '<p>Editor did not load. Reload the page if you want to try again.</p>'
      );
      clearInterval(loadLoop);
    }

    if (typeof $.summernote !== 'undefined') {
      // If it loads...
      clearInterval(loadLoop);
      // Remove the loading indicator.
      editbox.empty();
      // Insert the div for summernote to hook onto.
      let summer = $('<div class="summernote"></div>');
      editors.append(summer);
      // Activate summernote.
      summer.summernote({
        toolbar: toolbarOptions
      });
    }
  }, timedelay);

  // If we're not using the backpack, show a warning notice.
  if (!useBackpack) {
    let noSaveWarning = $('<div/>');
    noSaveWarning.css({
      'background-color': 'orange',
      border: '2px solid black'
    });
    noSaveWarning.append(
      'Warning: Data storage unavailable. This editor cannot save or load files. Reload the page if you want to try again.'
    );
    editors.prepend(noSaveWarning);
  }

  // Add save/load buttons.
  let savebutton = $('<button>Save</button>');
  savebutton.addClass('savenote');

  let loadbutton = $('<button>Load</button>');
  loadbutton.addClass('loadnote');

  let savenotice = $('<span> Loading...</span>');
  savenotice.addClass('autosavenotice');
  savenotice.css('color', 'darkgray');

  editors.prepend(savenotice);
  editors.prepend(savebutton);
  editors.prepend(loadbutton);

  // Save and load disabled until the backpack loads.
  if (!backpack_ready) {
    savebutton.attr('disabled', true);
    loadbutton.attr('disabled', true);
  }

  // Add listeners for save/load buttons.
  // Append the editor's id to their save slot.
  $('.savenote').on('click tap', function() {
    let markupStr = $('.hx-editor .summernote').summernote('code');

    // If we try to save while the backpack is recovering from auto-saving,
    // don't bother. Just show the success indicator.
    if (true) {
      hxSetData('summernote_' + getSaveSlot($(this)), markupStr);
      console.log(markupStr);
    }
    // These will automatically re-enable after the backpack loads.
    $('.loadnote').attr('disabled', true);
    $('.savenote').attr('disabled', true);
  });
  $('.loadnote').on('click tap', function() {
    $('.hx-editor .summernote').summernote(
      'code',
      hxGetData('summernote_' + getSaveSlot($(this)))
    );
  });

  // Set up loop to auto-save once/minute
  let autoSave = setInterval(function() {
    var to_save = {};
    editors.each(function(i, e) {
      let markupStr = $('.hx-editor .summernote').summernote('code');
      to_save['summernote_' + getSaveSlot($(e))] = markupStr;
    });
    hxSetData(to_save);
    $('.autosavenotice').text(' Auto-saving...');
    $('.loadnote').attr('disabled', true);
    $('.savenote').attr('disabled', true);
    console.log('auto-saved');
  }, 60000);

  // The save slot is the value in data-saveslot attribute, or '' if blank.
  // Pass in a JQuery object that's inside the editor's parent,
  // such as the save or load buttons.
  function getSaveSlot(t) {
    try {
      if (typeof t.attr('data-saveslot') === 'undefined') {
        return '';
      } else {
        return t.attr('data-saveslot');
      }
    } catch (err) {
      return '';
    }
  }

  function hearBackpackLoad(e) {
    // Only accept from edx sites.
    if (
      e.origin !== 'https://courses.edx.org' &&
      e.origin !== 'https://preview.edx.org' &&
      e.origin !== 'https://edge.edx.org'
    ) {
      return;
    }

    // Only accept objects with the right form.
    if (typeof e.data === 'string') {
      if (e.data === 'ready') {
        console.log('Backpack ready.');
        backpack_ready = true;
        $('.loadnote').removeAttr('disabled');
        $('.savenote').removeAttr('disabled');
        $('.autosavenotice').empty();
        // TODO: replace blank editors with the saved data.
      }
    }
  }
  addEventListener('message', hearBackpackLoad, false);
};
