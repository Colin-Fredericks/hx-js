// This is designed to be called by hx.js
// It uses the Summernote editor.

var HXEditor = function(use_backpack, toolbar_options) {
  var editors = $('.hx-editor:visible');

  logThatThing('HX Editor starting');

  // Wait for summernote to load.
  // It's in an external javascript file loaded by hx-js.
  var timer_count = 0;
  var time_delay = 250; // miliseconds
  var loadLoop = setInterval(function() {
    timer_count += time_delay;

    // If it doesn't load after 7 seconds,
    // kill the indicator and inform the learner.
    if (timer_count > 7000) {
      editors.empty();
      editors.append(
        '<p>Editor did not load. Reload the page if you want to try again.</p>'
      );
      clearInterval(loadLoop);
    }

    if (typeof $.summernote !== 'undefined') {
      // When it loads, stop waiting.
      clearInterval(loadLoop);
      // Clear the loading messages.
      editors.empty();
      // Turn on all editors on this page.
      activateAllEditors();
      setupAutoSave();
    }
  }, time_delay);

  // Unloads all previous autosave routines and adds new ones appropriately.
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
    console.log(slots);

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

        // Get the data from all editors.
        slots.forEach(function(slot) {
          let ed = $('[data-saveslot="' + slot + '"]');
          let new_data = ed.find('.summernote').summernote('code');

          // Using underscore.js to check object equality.
          if (!_.isEqual(hxGetData('summernote_' + slot), new_data)) {
            data_to_save['summernote_' + slot] = new_data;
            has_changed = true;
          }
        });

        // Only save if something changed.
        if (has_changed) {
          console.log('Save data:');
          console.log(data_to_save);
          hxSetData(data_to_save);
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

  // Turns on one particular editor.
  function activateEditor(saveslot) {
    console.log('activating ' + saveslot + ' editor');
    // Get the editor we're interested in.
    let ed = $('[data-saveslot="' + saveslot + '"]');
    if (ed.length === 0) {
      ed = $('.hx-editor');
      ed.attr('data-saveslot', '');
    }
    // Remove the loading indicator.
    ed.empty();
    // Insert the div for summernote to hook onto.
    let summer = $('<div class="summernote"></div>');
    ed.append(summer);
    // Activate summernote.
    summer.summernote({
      toolbar: toolbar_options
    });
    // Add load/save and possibly other controls
    addControls(ed);
    // Replace blank editors with the saved data if the backpack is loaded.
    if (hxBackpackLoaded) {
      if ($(ed.find('.summernote').summernote('code')).text() == '') {
        ed.find('.summernote').summernote(
          'code',
          hxGetData('summernote_' + getSaveSlot(ed))
        );
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
      editors.prepend(noSaveWarning);
    }
  }

  // Turns on ALL the editors.
  function activateAllEditors() {
    console.log('activating all editors');
    editors.each(function(i, e) {
      activateEditor(getSaveSlot($(e)));
    });
  }

  // Sometimes we need to rebuild this, so it gets its own function.
  // Pass in the jquery object for the editor.
  function buildMenu(ed) {
    let file_menu = $('<select></select>');
    let starting_value = 'new';

    let spacer1 = $('<option value="special-spacer1"></option>');
    let spacer2 = $('<option value="special-spacer2"></option>');
    let new_file = $('<option value="special-hx-new">New File...</option>');
    let rename_file = $(
      '<option value="special-hx-rename">Rename File...</option>'
    );
    file_menu.attr('id', 'hxed-loadmenu');
    file_menu.addClass('hxed-loadmenu hxeditor-control');
    file_menu.append(spacer1);
    file_menu.append(new_file);
    file_menu.append(rename_file);
    file_menu.append(spacer2);

    // Get all the summernote_whatever save slots and add to menu.
    let all_data = hxGetAllData();
    Object.keys(all_data).forEach(function(k) {
      let current_slot = false;
      k = k.replace('summernote_', '');
      if (getSaveSlot(ed) === k) {
        current_slot = true;
      }
      if (k === '') {
        k = 'Untitled';
      }
      let slot = $('<option value="summernote_' + k + '">' + k + '</option>');

      // Put current slot at top of menu.
      if (current_slot) {
        file_menu.prepend(slot);
        starting_value = 'summernote_' + k;
      } else {
        slot.addClass('hxed-slotchoice');
        file_menu.append(slot);
      }
    });

    file_menu.val(starting_value);

    return file_menu;
  }

  // Pass in the jquery object for the editor box.
  function rebuildMenu(editor) {
    // Clear and rebuild the menu.
    let new_menu = buildMenu(editor);
    editor.find('.hxed-loadmenu').remove();
    editor.prepend(new_menu);
    attachMenuListener(new_menu);
  }

  // Pass in the jquery object for the menu.
  function attachMenuListener(menu) {
    // Catch the previous menu item in case we need it.
    $(this)
      .off('focusin.hxeditor')
      .on('focusin.hxeditor', function() {
        $(this).data('previous-val', $(menu).val());
      });

    $(this)
      .off('change.hxeditor')
      .on('change.hxeditor', function(e) {
        let slot = e.target.value.replace('summernote_', '');
        if (slot === 'Untitled') {
          slot = '';
        }
        let editor = $(menu)
          .parent()
          .find('.summernote');

        // Ignore any blank slots.
        if (slot.startsWith('special-spacer')) {
          // put selector back where it was. Do nothing.
          $(menu).val($(this).data('previous-val'));
        }
        // Two special cases: new files and renaming existing files.
        else if (slot === 'special-hx-new') {
          let new_slot = prompt('Name your file:', 'new_file');
          if (new_slot === null || new_slot === '') {
            console.log('new file cancelled');
          } else {
            // Don't allow names that are identical to existing names.
            let all_slots = Object.keys(hxGetAllData());
            short_slots = all_slots.map(e => e.replace('summernote_', ''));
            if (short_slots.indexOf(new_slot) !== -1) {
              // Reject duplicate filename.
              $(menu).val($(this).data('previous-val'));
              // Give a notice.
              editor
                .parent()
                .find('.hxed-autosavenotice')
                .text('Duplicate filname, cannot create.');
              setTimeout(function() {
                editor
                  .parent()
                  .find('.hxed-autosavenotice')
                  .empty();
              }, 3000);
            } else {
              editor.parent().attr('data-saveslot', new_slot);
              editor.summernote('code', '<p><br/></p>');
              // Add the menu item.
              $(menu).prepend(
                '<option value="' + new_slot + '">' + new_slot + '</option>'
              );
              $(menu).val(new_slot);
              attachMenuListener(menu);
              // Save.
              hxSetData('summernote_' + new_slot, '<p><br/></p>');
            }
          }
        } else if (slot === 'special-hx-rename') {
          let current_slot = getSaveSlot(editor.parent());
          let rename_slot = prompt('Rename to:', current_slot);
          if (rename_slot === null || rename_slot === '') {
            console.log('rename cancelled');
          } else {
            // Rename the save slot.
            editor.parent().attr('data-saveslot', rename_slot);
            // Change the menu item.
            $('option[value="' + current_slot + '"]').remove();
            $(menu).prepend(
              '<option value="' + new_slot + '">' + new_slot + '</option>'
            );
            $(menu).val(rename_slot);
            attachMenuListener(menu);
            // Remove the old data.
            hxClearData(current_slot);
            // Save.
            hxSetData('summernote_' + rename_slot, getMarkupFrom(rename_slot));
          }
        }
        // Otherwise, we're switching to a different save slot.
        else {
          // Replace text.
          editor.summernote('code', hxGetData('summernote_' + slot));
          // Change the data attribute on the editor.
          editor.parent().attr('data-saveslot', slot);
        }
      });
  }

  // Create and activate a link to download the current text.
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

  // Add save/load/delete and other controls.
  function addControls(ed) {
    let file_menu = buildMenu(ed);

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
    ed.prepend(file_menu);

    // Save and load disabled until the backpack loads.
    // It could be already loaded, so don't disable unnecessicarily.
    if (typeof hxBackpackLoaded === 'undefined') {
      $('.hxeditor-control').prop('disabled', true);
      save_notice.text(' Loading...');
    }

    // Add listeners for the menu.
    attachMenuListener(file_menu);

    // Listener for the download button.
    // Gives learner a document with an HTML fragment.
    download_button.on('click tap', function() {
      let markup_string = $(this)
        .parent()
        .find('.summernote')
        .summernote('code');
      provideDownload(getSaveSlot($(this).parent()) + '.html', markup_string);
    });

    save_button.on('click tap', function() {
      let markup_string = $(this)
        .parent()
        .find('.summernote')
        .summernote('code');

      // Note the editor's saveslot.
      hxSetData('summernote_' + getSaveSlot($(this).parent()), markup_string);

      // Disable save/load buttons.
      // These will re-enable after the backpack loads.
      $('.hxed-autosavenotice').text(' Saving...');
      $('.hxeditor-control').prop('disabled', true);
    });

    delete_button.on('click tap', function() {
      // ARE YOU SURE???
      let wreck_it = confirm('Are you sure you want to delete this file?');
      if (wreck_it) {
        // Clear the data and then rebuild the menu.
        const p = new Promise(function(res, rej) {
          resolve(hxClearData('summernote_' + getSaveSlot($(this).parent())));
        });
        p.then(function(res) {
          if (res) {
            // Clear and rebuild the menu.
            rebuildMenu($(this).parent());
          }
        });
        // Erase the text.
        $(this)
          .parent()
          .find('.summernote')
          .summernote('code', '<p></p>');
        // Blank out the save slot for the editor.
        $(this)
          .parent()
          .attr('sata-saveslot', '');
      }
    });
  }

  // The save slot is the value in data-saveslot attribute, or '' if blank.
  // Pass in the JQuery object for this editor.
  function getSaveSlot(e) {
    try {
      if (typeof e.attr('data-saveslot') === 'undefined') {
        return '';
      } else {
        return e.attr('data-saveslot');
      }
    } catch (err) {
      return '';
    }
  }

  function getMarkupFrom(slot) {
    return $('[data-saveslot="' + slot + '"] .summernote').summernote('code');
  }

  // The backpack is our data storage system on edX.
  // It posts a message when it loads.
  // See https://github.com/Stanford-Online/js-input-samples/tree/master/learner_backpack
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
          $('.hxeditor-control').prop('disabled', false);
          $('.hxed-autosavenotice').empty();
          // Replace blank editors with the saved data.
          $('.hx-editor').each(function(i, el) {
            let editor = $(el).find('.summernote');
            let saveslot = getSaveSlot($(el));
            console.log('restoring editor ' + saveslot);
            if ($(editor.summernote('code')).text() == '') {
              editor.summernote('code', hxGetData('summernote_' + saveslot));
            }
          });
        }
      }
    });

  // Publishing functions for general use.
  window.HXED = {};
  window.HXED.getSaveSlot = getSaveSlot;
  window.HXED.getMarkupFrom = getMarkupFrom;
  window.HXED.activateEditor = activateEditor;
  window.HXED.activateAllEditors = activateAllEditors;
};
