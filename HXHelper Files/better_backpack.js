////////////////////////////////////////////////////////////////////////////
// Making the learner backpack easier to access and use.
// Colin Fredericks, Harvard
// MIT license
////////////////////////////////////////////////////////////////////////////

/*************************************
This script acts on elements with the following data attributes:

data-backpack-entry="varname" - flags text in this element for storage.
data-backpack-save-button="varname" - save the "entry" data for this variable when clicked.
data-backpack-autofill="varname" - auto-fill textarea, text input box, or text element on load.
data-backpack-fill="varname" - fills "get" items when clicked.
data-backpack-clear="varname" - removes the value from the backpack.

There are also "-all" variants for save, fill, and clear, like
data-backpack-save-all-button, that act on all elements on the page regardless
of their variable names.

data-backpack-save-form="varname" - saves all the data from this form, serialized.
data-backpack-autofill-form="varname" - like "autofill" above.
data-backpack-fill-form="varname" - like "fill" above.

These do not have "all" variants. They work on the form they're in.

data-backpack-loading="true" - you can put a "loading" message in this element.
data-backpack-error="true" - you can put a "failed to load" message in this element.
data-backpack-success="true" - you can put an "it loaded" message in this element.
data-wait-for-backpack="true" - put this on disabled elements. They will enable when it loads.
You should hide the error and success elements with display:none. They'll be shown later.

TROUBLESHOOTING:
- Most common issue: Did the student agree to the honor code?
- If there are multiple elements on a page with the same variable name, it'll only store the last one.
-
*************************************/

/***********************/
/* On Backpack Load    */
/***********************/

// Only run the "when backpack ready" scripts on page load.
// Otherwise every hxSetData call creates an infinite loop.
let hx_better_backpack_first_load = true;

// When the backpack is ready, do certain things.
$(window)
  .off('message.bkpk')
  .on('message.bkpk', function (e) {
    if (
      e.originalEvent.origin === location.origin &&
      e.originalEvent.data === 'backpack_ready' &&
      hx_better_backpack_first_load
    ) {
      try {
        first_load = false;
        whenBackpackReady();
      } catch (ReferenceError) {
        // just ignore it - if function_list isn't defined, we don't want to run it anyway.
      }
    }
  });

function whenBackpackReady(function_list) {
  // And we still can't trust that it's ready because race conditions, so...
  let timer = 0;
  let wait_for_backpack = setInterval(function () {
    console.debug('tick: ' + timer);
    timer += 0.25; //seconds
    if (timer > 5) {
      clearInterval(wait_for_backpack);
      console.debug("Backpack didn't load in 5 seconds.");
      $('[data-backpack-error]').show();
      $('[data-backpack-loading]').hide();
    }
    if (hxBackpackLoaded) {
      clearInterval(wait_for_backpack);

      console.debug('calling function list');
      setListeners();

      console.debug('Done loading');
      $('[data-backpack-success]').show();
      $('[data-backpack-loading]').hide();
      $('[data-backpack-success]').prop('disabled', false);
    }
  }, 250);
}

function setListeners() {
  // Fill the autofill items first.
  let elements_to_autofill = $('[data-backpack-autofill]');
  let forms_to_fill = $('[data-backpack-autofill-form]');
  fillElementData(None, elements_to_fill, 'all');
  fillFormData(None, forms_to_fill);

  let elements_to_store = $('[data-backpack-entry]');
  let save_buttons = $('[data-backpack-save-button]');
  let save_all_buttons = $('[data-backpack-save-all-button]');
  save_buttons.on('click', function(){ storeElementData(this, elements_to_store, 'one'); });
  save_all_buttons.on('click', function(){ storeElementData(this, elements_to_store, 'all'); });

  let fill_buttons = $('[data-backpack-fill]');
  let fill_all_buttons = $('[data-backpack-fill-all]');
  fill_buttons.on('click', function(){ fillElementData(this, elements_to_autofill, 'one'); });
  fill_all_buttons.on('click', function(){ fillElementData(this, elements_to_autofill, 'all'); });

  let clear_buttons = $('[data-backpack-clear]');
  let clear_all_buttons = $('[data-backpack-clear-all]');
  clear_buttons.on('click', function(){ clearData(this, 'one'); });
  clear_all_buttons.on('click', function(){ clearData(this, 'all'); });

  let save_form_button = $('[data-backpack-save-form]');
  let fill_form_button = $('[data-backpack-fill-form]');
  save_form_button.on('click', function(){ saveFormData(this); });
  fill_form_button.on('click', function(){ fillFormData(this, forms_to_fill); });
}

// Takes data from the selected elements and stores it in the backpack.
// edX sanitizes the data on their end via URI encoding.
function storeElementData(elements, quantity) {
  if (quantity === 'all') {
    // Get all the elements with data-backpack-entry set regardless of variable.
    let all_entries = $('[data-backpack-entry]');
    // Store all of their info in the backpack.
    // Copy from updateBackpack() below.
    // Values for form elements, text for other HTML elements
  } else if (quantity === 'one') {
    // Get the variable name from the element that called this.
    // Store just the info from entries of that variable.
  } else {
    console.debug('bad quantity specified for storeElementData()');
  }
}

// Gets data from the backpack and puts it into the selected elements.
function fillElementData(elements, quantity) {

  // Get all the data for this student.
  let student_data = hxGetAllData();
  console.debug(student_data);
  if (quantity === 'all') {
    elements.each(function (i, e, student_data) {
      let varname = e.attrib(data - backpack - entry);
      insertData(e, student_data[varname]);
    });
  } else if (quantity === 'one') {
    // Get the variable name from the element that called this.
    // Fill just the elements whose data-backpack-entry matches the variable.
  } else {
    console.debug('bad quantity specified for fillElementData()');
  }
}

function clearElementData(elements, quantity) {}

function fillFormData(form) {}

function saveFormData() {}

// Logic for deciding how to fill different tag types.
function insertData(element, data) {
  if (element.tagName === 'INPUT') {
    // Don't fill input boxes if they already have stuff in them.
    console.log(element.value);
    if (element.value === '') {
      element.value = data;
    }
  } else {
    // Here it's ok to overwrite whatever's there.
    element.innerHTML = data;
  }
}

/***********************/
/* Leftover functions from earlier version, to be retooled.
/***********************/

// Pulls all scores from appropriately ID'd input boxes and puts them in the backpack.
function updateBackpack() {
  console.debug('Adding scores to backpack');

  found_scores = {};

  // Get the values for all the scores we want.
  for (let i = 0; i < valid_scores.length; i++) {
    input_box = document.querySelectorAll('input#' + valid_scores[i]);
    // But only if there's actually a value in the input box.
    if (input_box.length > 0) {
      if (input_box[0].value !== '') {
        found_scores[valid_scores[i]] = input_box[0].value;
      }
    }
  }

  // Set scores and hide/show messages appropriately.
  if (hxBackpackLoaded) {
    hxSetData(found_scores);
    $('[data-backpack-success]').show();
    $('[data-backpack-error]').hide();
  } else {
    $('[data-backpack-error]').show();
    console.log('no backpack found');
  }
}
