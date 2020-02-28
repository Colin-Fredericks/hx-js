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
  function buildMenu(ed){
    let load_menu = $('<select></select>');
    let starting_value='new';
  
    let spacer1 = $('<option value="spacer1"></option>');
    let spacer2 = $('<option value="spacer2"></option>');
    let new_file = $('<option value="new">New File...</option>');
    let rename_file = $('<option value="rename">Rename File...</option>');
    load_menu.attr('id', 'hxed-loadmenu');
    load_menu.addClass('hxed-loadmenu hxeditor-control');
    load_menu.append(spacer1);
    load_menu.append(new_file);
    load_menu.append(rename_file);
    load_menu.append(spacer2);

    // Get all the summernote_whatever save slots and add to menu.
    let all_data = hxGetAllData();
    Object.keys(all_data).forEach(function(k){
      let current_slot = false;
      k = k.replace('summernote_','');
      if( getSaveSlot(ed) === k ){
        current_slot = true;
      }      
      if(k === ''){ k = 'Untitled'; }
      let slot = $('<option value="summernote_' + k + '">' + k + '</option>');

      // Put current slot at top of menu.
      if(current_slot){ 
        load_menu.prepend(slot); 
        starting_value = 'summernote_' + k;
      }else{
        slot.addClass('hxed-slotchoice');
        load_menu.append(slot);
      }
    });
    
    load_menu.val(starting_value);
    
    return load_menu;

  }
  
  // Pass in the query object for the menu.
  function attachMenuListener(menu){
    $(this).on('change', function(e){
      console.log(e);
    });
  }
  
  // Create and activate a link to download the current text.
  function provideDownload(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  // Add save/load/delete and other controls.
  function addControls(ed) {
  
    let load_menu = buildMenu(ed);
  
    let download_button = $('<button><span class="fa fa-download"></span> Download</button>');
    download_button.addClass('hxed-download hxeditor-control');

    let save_button = $('<button><span class="fa fa-floppy-o"></span> Save</button>');
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
    ed.prepend(load_menu);

    // Save and load disabled until the backpack loads.
    // It could be already loaded, so don't disable unnecessicarily.
    if (typeof hxBackpackLoaded === 'undefined') {
      $('.hxeditor-control').prop('disabled', true);
      save_notice.text(' Loading...');
    }

    // Add listeners for all the controls.
    attachMenuListener(load_menu);
    
    download_button.on('click tap', function(){
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

    delete_button.on('click tap', function(){
      // ARE YOU SURE???
      let wreck_it = confirm("Are you sure you want to delete this file?");
      if( wreck_it ) {
        hxClearData('summernote_' + getSaveSlot($(this).parent()));
        $(this).parent().find('.summernote').summernote('code', '<p></p>');
        // Clear and rebuild the menu.
        let new_menu = buildMenu($(this).parent());
        $(this).parent().find('.hxed-loadmenu').remove();
        $(this).parent().prepend(new_menu);
        attachMenuListener(new_menu);
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
