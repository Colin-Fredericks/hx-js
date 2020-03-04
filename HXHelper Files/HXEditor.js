// This is designed to be called by hx.js
// It uses the Summernote editor.

var HXEditor = function(use_backpack, toolbar_options) {
  const prefix = 'summernote_'; // slot prefix for data storage
  const blank_editor = '<p><br/></p>';

  logThatThing('HX Editor starting');

  //***************************
  // Utility functions
  // for handling data.
  //***************************

  // These functions make handling prefixes easier.
  function getData(slot) {
    return hxGetData(prefix + slot);
  }

  function setData(slot, val) {
    if (typeof val === undefined) {
      // It's not a save slot, it's an object.
      let new_data = {};
      Object.keys(slot).forEach(function(k) {
        // Prefix all the data before storing it, to avoid collisions.
        new_data[prefix + k] = slot[k];
      });
      return hxSetData(new_data);
    } else {
      return hxSetData(prefix + slot, val);
    }
  }

  function clearData(slot) {
    return hxClearData(prefix + slot);
  }

  function getAllData() {
    let new_data = {};
    let old_data = hxGetAllData();
    Object.keys(old_data).forEach(function(k) {
      // Only return data with our namespace prefix.
      if (k.startsWith(prefix)) {
        // de-prefix all the stored data.
        new_data[k.replace(prefix, '')] = old_data[k];
      }
    });
    return new_data;
  }

  //********************************
  // Utility functions
  // for working with DOM elements.
  //********************************

  // The save slot is the value in data-saveslot attribute, or '' if blank.
  // Pass in the JQuery object for a child of this editor.
  function getSaveSlot(e) {
    if (e.is('[data-saveslot]')) {
      return e.attr('data-saveslot');
    } else {
      let editor = e.parents('[data-saveslot]');
      return editor.attr('data-saveslot');
    }
  }

  function getEditBox(slot) {
    return $('[data-saveslot="' + slot + '"]');
  }

  function getMarkupFrom(slot) {
    return $(getEditBox(slot))
      .find('.summernote')
      .summernote('code');
  }

  function setMarkupIn(slot, markup_string) {
    $(getEditBox(slot))
      .find('.summernote')
      .summernote('code', markup_string);
  }

  // Which entry in our menu is the topmost actual file?
  function getTopFile(edit_box) {
    let menu = edit_box.find('.hxed-filemenu');
    let top_file;
    let special_entries = [
      'special-spacer1',
      'special-spacer2',
      'special-hx-new',
      'special-hx-rename'
    ];
    $(menu)
      .find('option')
      .each(function(i, e) {
        // The first time we can't find a filename in the list of special entries...
        if (special_entries.indexOf(e.value) === -1) {
          top_file = e.value;
          return false; // Breaks out of each() loop
        }
      });
    return top_file;
  }

  //********************************
  // Auto-save. Runs every minute.
  // One function for all editors on the page.
  //********************************
  function setupAutoSave() {
    console.log('setting up auto-save');
    // Wipe out the old autosave function.
    if (typeof window.autosavers !== 'undefined') {
      clearInterval(window.autosavers);
    }

    // Get all the save slots that are present on this page.
    let slots = new Set(
      Object.keys($('.hx-editor')).map(x =>
        $($('.hx-editor')[x]).attr('data-saveslot')
      )
    );
    // Remove undefined things from the set.
    slots.delete(undefined);

    // Store data as object. It'll get JSON-ized on save.
    window.saveData = {};

    // Make an autosave function that gets data from all editors.
    window.autosavers = setInterval(function() {
      // If there are no editors visible on the page, kill this loop.
      if ($('.hx-editor').length < 1) {
        console.log('No editors detected. Turning off auto-save.');
        clearInterval(window.autosavers);
      } else {
        let has_changed = false;
        let data_to_save = {};
        let existing_data = getAllData();

        // Get the data from all visible editors.
        slots.forEach(function(slot) {
          let new_data = getMarkupFrom(slot);
          if (typeof new_data === 'string') {
            // Using underscore.js to check object equality.
            if (!_.isEqual(existing_data[slot], new_data)) {
              data_to_save[slot] = new_data;
              has_changed = true;
            }
          }
        });

        // Only save if something changed.
        if (has_changed) {
          console.log('Save data:');
          console.log(data_to_save);
          setData(data_to_save);
          // Disable save/load buttons until the backpack reloads.
          $('.hxed-autosavenotice').text(' Auto-saving...');
          $('.loadnote').prop('disabled', true);
          $('.hxed-save').prop('disabled', true);
        } else {
          console.log('No change in data, not saving.');
        }
      }
    }, 60000);
  }

  //********************************
  // Activate an editor and load stored info.
  //********************************
  function activateEditor(slot) {
    console.log('activating ' + slot + ' editor');
    // Get the editor we're interested in.
    let ed = getEditBox(slot);
    let starting_markup = blank_editor;
    if (ed.length === 0) {
      ed = $('.hx-editor');
      ed.attr('data-saveslot', '');
    }
    // Remove the loading indicator
    $('.hx-loading-indicator').remove();
    // Store any existing markup as default content.
    starting_markup = ed
      .find('.hx-editor-default')
      .html()
      .trim();
    console.log(starting_markup);
    ed.empty();
    // Insert the div for summernote to hook onto.
    let summer = $('<div class="summernote"></div>');
    ed.append(summer);
    // Activate summernote.
    summer.summernote({
      toolbar: toolbar_options
    });

    // Add save/download/delete and file menu.
    addControls(ed);
    let data = getAllData();
    // Make sure the data includes a slot for the current menu.
    // Default content does not overwrite existing data.
    if (data.hasOwnProperty(slot)) {
      starting_markup = data[slot];
    } else {
      data[slot] = starting_markup;
    }
    let file_menu = buildMenu(ed, data, getSaveSlot(ed));
    ed.prepend(file_menu);
    // Add listeners for the menu.
    attachMenuListener(file_menu);

    // Replace blank editors with the saved data if the backpack is loaded.
    if (hxBackpackLoaded) {
      if ($(getMarkupFrom(slot)).text() == '') {
        setMarkupIn(slot, starting_markup);
      }
    }
    // If we're not using the backpack, show a warning notice.
    if (!use_backpack) {
      let noSaveWarning = $('<div/>');
      noSaveWarning.css({
        'background-color': 'orange',
        border: '2px solid black'
      });
      noSaveWarning.append(
        'Warning: Data storage unavailable. This editor cannot save or load files. Reload the page if you want to try again.'
      );
      $('.hx-editor:visible').prepend(noSaveWarning);
    }
  }

  // Turns on ALL the editors.
  function activateAllEditors() {
    $('.hx-editor:visible').each(function(i, e) {
      activateEditor(getSaveSlot($(e)));
    });
  }

  //********************************
  // Build the file menu.
  // Sometimes we need to rebuild this, so it gets its own function.
  //********************************
  function buildMenu(ed, data, starting_file) {
    let file_menu = $('<select></select>');

    let spacer1 = $('<option value="special-spacer1"></option>');
    let spacer2 = $('<option value="special-spacer2"></option>');
    let new_file = $('<option value="special-hx-new">New File...</option>');
    let rename_file = $(
      '<option value="special-hx-rename">Rename File...</option>'
    );
    file_menu.addClass('hxed-filemenu hxeditor-control');
    file_menu.append(spacer1);
    file_menu.append(new_file);
    file_menu.append(rename_file);
    file_menu.append(spacer2);

    if (starting_file === '') {
      starting_file = 'Untitled';
    }

    // Get all the save slots and add to menu.
    Object.keys(data).forEach(function(k) {
      let is_current_slot = false;
      if (getSaveSlot(ed) === k) {
        is_current_slot = true;
      }
      if (k === '') {
        k = 'Untitled';
      }
      let slot = $('<option value="' + k + '">' + k + '</option>');
      file_menu.append(slot);
    });

    // Move starting file to top.
    file_menu
      .find('option[value="' + starting_file + '"]')
      .detach()
      .prependTo(file_menu);

    file_menu.val(starting_file);

    return file_menu;
  }

  // Pass in the jquery object for the editor box.
  function rebuildMenu(editor, data, starting_file) {
    // Clear and rebuild the menu.
    let new_menu = buildMenu(editor, data, starting_file);
    editor.find('.hxed-filemenu').remove();
    editor.prepend(new_menu);
    attachMenuListener(new_menu);
  }

  function attachMenuListener(menu) {
    // Catch the previous menu item in case we need it.
    $(this)
      .off('focusin.hxeditor')
      .on('focusin.hxeditor', function() {
        $(this).attr('data-previous-val', $(menu).val());
      });

    $(this)
      .off('change.hxeditor')
      .on('change.hxeditor', function(e) {
        let slot = e.target.value;
        if (slot === 'Untitled') {
          slot = '';
        }
        let edit_box = getEditBox(getSaveSlot($(menu)));

        // Ignore any blank slots.
        if (slot.startsWith('special-spacer')) {
          // put selector back where it was. Do nothing.
          $(menu).val($(this).attr('data-previous-val'));
        }
        // Two special cases: new files and renaming existing files.
        else if (slot === 'special-hx-new') {
          let new_slot = prompt('Name your file:', 'new_file');
          if (new_slot === null || new_slot === '') {
            console.log('new file cancelled');
          } else {
            // Don't allow names that are identical to existing names.
            let all_slots = Object.keys(getAllData());
            if (all_slots.indexOf(new_slot) !== -1) {
              // Reject duplicate filename.
              $(menu).val($(this).attr('data-previous-val'));
              // Give a notice.
              edit_box
                .find('.hxed-autosavenotice')
                .text('Duplicate filname, cannot create.');
              setTimeout(function() {
                edit_box.find('.hxed-autosavenotice').empty();
              }, 3000);
            } else {
              edit_box.attr('data-saveslot', new_slot);
              setMarkupIn(new_slot, blank_editor);
              // Add the menu item.
              $(menu).prepend(
                '<option value="' + new_slot + '">' + new_slot + '</option>'
              );
              $(menu).val(new_slot);
              attachMenuListener(menu);
              // Save.
              setData(new_slot, blank_editor);
            }
          }
        } else if (slot === 'special-hx-rename') {
          let current_slot = getSaveSlot(summer);
          let rename_slot = prompt('Rename to:', current_slot);
          if (rename_slot === null || rename_slot === '') {
            console.log('rename cancelled');
          } else {
            // Rename the save slot.
            edit_box.attr('data-saveslot', rename_slot);
            // Change the menu item.
            let option = $('option[value="' + current_slot + '"]');
            option.detach().prependTo($(menu));
            option.val(rename_slot);
            option.empty();
            option.text(rename_slot);
            $(menu).val(rename_slot);
            attachMenuListener(menu);
            // Remove the old data.
            clearData(current_slot);
            // Save.
            setData(rename_slot, getMarkupFrom(rename_slot));
          }
        }
        // Otherwise, we're switching to a different save slot.
        else {
          // Replace text.
          summer.summernote('code', getData(slot));
          // Change the data attribute on the editor.
          edit_box.attr('data-saveslot', slot);
        }
      });
  }

  //********************************
  // Create and activate a link to download the current text.
  // Saves as an HTML fragment.
  //********************************
  function provideDownload(filename, text) {
    let element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/html;charset=utf-8,' + encodeURIComponent(text)
    );
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  //********************************
  // Save, delete, and download buttons.
  //********************************
  function addControls(ed) {
    let download_button = $(
      '<button><span class="fa fa-download"></span> Download</button>'
    );
    download_button.addClass('hxed-download hxeditor-control');

    let save_button = $(
      '<button><span class="fa fa-floppy-o"></span> Save</button>'
    );
    save_button.addClass('hxed-save hxeditor-control');

    let save_notice = $('<span/>');
    save_notice.addClass('hxed-autosavenotice');

    let persistent_notice = $('<span/>');
    persistent_notice.addClass('hxed-persistentnotice');

    let delete_button = $('<button/>');
    delete_button.addClass('fa fa-trash hxed-deletebutton hxeditor-control');
    delete_button.attr('role', 'button');

    ed.prepend(delete_button);
    ed.prepend(persistent_notice);
    ed.prepend(save_notice);
    ed.prepend(save_button);
    ed.prepend(download_button);

    // Save and load disabled until the backpack loads.
    // It could be already loaded, so don't disable unnecessicarily.
    if (typeof hxBackpackLoaded === 'undefined') {
      $('.hxeditor-control').prop('disabled', true);
      save_notice.text(' Loading...');
    }

    // Listener for the download button.
    // Gives learner a document with an HTML fragment.
    download_button.on('click tap', function() {
      let slot = getSaveSlot($(this));
      let markup_string = getMarkupFrom(slot);
      provideDownload(slot + '.html', markup_string);
    });

    save_button.on('click tap', function() {
      let slot = getSaveSlot($(this));
      let markup_string = getMarkupFrom(slot);

      // Note the editor's saveslot.
      console.log('Saving to ' + slot);
      setData(slot, markup_string);

      // Disable save/load buttons.
      // These will re-enable after the backpack loads.
      $('.hxed-autosavenotice').text(' Saving...');
      $('.hxeditor-control').prop('disabled', true);
    });

    delete_button.on('click tap', function() {
      // ARE YOU SURE???
      let wreck_it = confirm('Are you sure you want to delete this file?');
      if (wreck_it) {
        // Rebuild the menu without the offending item.
        let temp_data = getAllData();
        let slot = getSaveSlot($(this));
        let edit_box = getEditBox(slot);
        // Erase the text.
        edit_box.find('.summernote').summernote('code', blank_editor);

        // Remove the file from our temp version of the data.
        delete temp_data[slot];

        // Remove the data from the backpack.
        // This takes about a second, so don't wait for it.
        clearData(slot);

        // Rebuild the menu from our temp data.
        rebuildMenu(edit_box, temp_data, getTopFile(edit_box));

        // Reassign the save slot for this editor.
        edit_box.attr('data-saveslot', getTopFile(edit_box));
      }
    });
  }

  //********************************
  // The backpack is our data storage system on edX.
  // It posts a message when it loads.
  // See https://github.com/Stanford-Online/js-input-samples/tree/master/learner_backpack
  //********************************
  $(window)
    .off('message.hxeditor')
    .on('message.hxeditor', function(e) {
      var data = e.originalEvent.data;

      // Only accept from edx sites.
      if (
        e.originalEvent.origin !== 'https://courses.edx.org' &&
        e.originalEvent.origin !== 'https://preview.edx.org' &&
        e.originalEvent.origin !== 'https://edge.edx.org'
      ) {
        return;
      }

      // Only accept objects with the right form.
      if (typeof data === 'string') {
        if (data === 'ready') {
          // When the backpack is ready, re-enable the controls.
          $('.hxeditor-control').prop('disabled', false);
          $('.hxed-autosavenotice').empty();
          // Replace blank editors with the saved data.
          $('.hx-editor').each(function(i, el) {
            let slot = getSaveSlot($(el));
            let existing_markup = getMarkupFrom(slot);
            console.log('restoring editor ' + slot);
            if ($(existing_markup).text() == '') {
              let new_markup = getData(slot);
              if (new_markup !== null) {
                setMarkupIn(slot, new_markup);
              } else {
                setMarkupIn(slot, blank_editor);
              }
            }
          });
        }
      }
    });

  // Publishing functions for general use.
  window.HXED = {};
  window.HXED.getEditBox = getEditBox;
  window.HXED.getSaveSlot = getSaveSlot;
  window.HXED.getMarkupFrom = getMarkupFrom;
  window.HXED.activateEditor = activateEditor;
  window.HXED.activateAllEditors = activateAllEditors;

  //********************************
  // START HERE.
  // This loop waits for summernote to load.
  // It's in an external javascript file loaded by hx-js.
  //********************************
  var timer_count = 0;
  var time_delay = 250; // miliseconds
  var loadLoop = setInterval(function() {
    timer_count += time_delay;

    // If it doesn't load after 7 seconds,
    // kill the indicator and inform the learner.
    if (timer_count > 7000) {
      $('.hx-editor:visible').empty();
      $('.hx-editor:visible').append(
        '<p>Editor did not load. Reload the page if you want to try again.</p>'
      );
      clearInterval(loadLoop);
    }

    if (typeof $.summernote !== 'undefined') {
      // When it loads, stop waiting.
      clearInterval(loadLoop);
      // Turn on all editors on this page.
      activateAllEditors();
      setupAutoSave();
    }
  }, time_delay);
};
