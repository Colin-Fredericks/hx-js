// This version is designed to be called by hx.js
// It uses the Summernote editor.

var HXEditor = function(useBackpack, toolbarOptions) {
  var editors = $('.hx-editor');

  // Read the save slot from the data-saveslot attribute.
  var editor_save_slots = Object.keys($('div')).map(function(k, i) {
    try {
      return $('div')[k].attributes['data-saveslot'];
    } catch (err) {
      return '';
    }
  });

  // Insert a loading indicator.
  let editbox = $('<div class="editorloading"> Loading...</div>');
  let spinner = $('<span class="fa fa-spinner fa-pulse"></span>');
  editbox.prepend(spinner);
  editors.append(loading);

  // Wait for summernote to load.
  // It's in an external javascript file loaded by hx-js.
  var timercount = 0;
  var timedelay = 0.25; // seconds
  var loadLoop = setTimeout(function() {
    timercount += timedelay;

    // If it doesn't load after 7 seconds,
    // kill the indicator and inform the learner.
    if (timercount > 7) {
      editbox.empty();
      editbox.append(
        '<p>Editor did not load. Reload the page if you want to try again.</p>'
      );
      clearTimeout(loadLoop);
    }

    if (typeof summernote !== 'undefined') {
      // If it loads...
      // Remove the loading indicator.
      editbox.empty();
      // Insert the div for summernote to hook onto.
      editors.append('<div class="summernote"></div>');
      // Activate summernote.
      $('.summernote').summernote({
        toolbar: toolbarOptions
      });
    }
  }, timedelay * 1000);

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
  let saveindicator = $('<span/>');

  let loadbutton = $('<button>Load</button>');
  savebutton.addClass('loadnote');
  editors.prepend(saveindicator);
  editors.prepend(savebutton);
  editors.prepend(loadbutton);

  // Add listeners for save/load buttons.
  // Append the editor's id to their save slot.
  $('#savenote').on('click tap', function() {
    let save_slot = this.parent().attr('data-saveslot');
    let markupStr = $('.summernote').summernote('code');

    // If we try to save while the backpack is recovering from auto-saving,
    // don't bother. Just show the success indicator.
    if (true) {
      hxSetData('summernote_' + save_slot, markupStr);
      console.log(markupStr);
    }
    // TODO: Indicate success for saving.
  });
  $('#loadnote').on('click tap', function() {
    let parentID = this.parent().attr('data-saveslot');
    $('.summernote').summernote('code', hxGetData('summernote_' + save_slot));
  });

  // Set up loop to auto-save once/minute
  let autoSave = setTimeout(function() {
    var to_save = {};
    editors.each(function(i, e) {
      let save_slot = e.attr('data-saveslot');
      let markupStr = $('#summernote').summernote('code');
      to_save['summernote_' + saveslot] = markupStr;
    });
    hxSetData(to_save);
    console.log('auto-saved');
  }, 60000);
};
