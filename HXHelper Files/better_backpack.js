////////////////////////////////////////////////////////////////////////////
// Making the learner backpack easier to access and use.
// Colin Fredericks, Harvard
// MIT license
////////////////////////////////////////////////////////////////////////////

/*************************************
This script acts on elements with the following data attributes:

data-bkpk-input-for="varname" - flags text in this element for storage.
data-bkpk-save-button="varname" - save the "input-for" data for this variable when clicked.
data-bkpk-fill-with="varname" - fill this element with data on load.
data-bkpk-fill-button="varname" - fills "fill-with" items when clicked.
data-bkpk-clear="varname" - removes the value from the backpack.

There are also "-all" variants for save, fill, and clear, like
data-bkpk-save-all-button, that act on all elements on the page regardless
of their variable names.

data-bkpk-loading="true" - you can put a "loading" message in this element.
data-bkpk-error="true" - you can put a "failed to load" message in this element.
data-bkpk-success="true" - you can put an "it loaded" message in this element.
data-wait-for-bkpk="true" - put this on disabled elements. They will enable when it loads.
You should hide the error and success elements with display:none. They'll be shown later.

TROUBLESHOOTING:
- Most common issue: Did the student agree to the honor code?
- If there are multiple elements on a page with the same variable name, it'll only store the first one.

The following items are intended for later expansion:
---------------
data-bkpk-save-form="varname" - saves all the data from this form, serialized.
data-bkpk-fill-with-form="varname" - like "autofill" above.
data-bkpk-fill-form-button="varname" - like "fill" above.

These do not have "all" variants. They work on the form they're in.

*************************************/

/***********************/
/* On Backpack Load    */
/***********************/

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
      first_load = false;
      whenBackpackReady();
    }
  });

function whenBackpackReady() {
  // And we still can't trust that it's ready because race conditions, so...
  let timer = 0;
  let wait_for_backpack = setInterval(function () {
    console.debug('tick: ' + timer);
    timer += 0.25; //seconds
    if (timer > 5) {
      clearInterval(wait_for_backpack);
      console.debug("Backpack didn't load in 5 seconds.");
      $('[data-bkpk-error]').show();
      $('[data-bkpk-loading]').hide();
    }
    if (hxBackpackLoaded) {
      clearInterval(wait_for_backpack);
      setListeners();
      console.debug('Done loading');
      $('[data-bkpk-success]').show();
      $('[data-bkpk-loading]').hide();
      $('[data-bkpk-success]').prop('disabled', false);
    }
  }, 250);
}

function setListeners() {
  // Fill the autofill items first.
  let elements_to_autofill = $('[data-bkpk-fill-with]');
  let forms_to_fill = $('[data-bkpk-fill-with-form]');
  fillElementData(null, elements_to_autofill, 'all');
  fillFormData(null, forms_to_fill);

  let elements_to_store = $('[data-bkpk-input-for]');
  let save_buttons = $('[data-bkpk-save-button]');
  let save_all_buttons = $('[data-bkpk-save-all-button]');
  save_buttons.on('click', function () {
    storeElementData(this, elements_to_store, 'one');
  });
  save_all_buttons.on('click', function () {
    storeElementData(this, elements_to_store, 'all');
  });

  let fill_buttons = $('[data-bkpk-fill-button]');
  let fill_all_buttons = $('[data-bkpk-fill-all-button]');
  fill_buttons.on('click', function () {
    fillElementData(this, elements_to_autofill, 'one');
  });
  fill_all_buttons.on('click', function () {
    fillElementData(this, elements_to_autofill, 'all');
  });

  let clear_buttons = $('[data-bkpk-clear]');
  let clear_all_buttons = $('[data-bkpk-clear-all]');
  clear_buttons.on('click', function () {
    clearData(this, 'one');
  });
  clear_all_buttons.on('click', function () {
    clearData(this, 'all');
  });

  let save_form_button = $('[data-bkpk-save-form]');
  let fill_form_button = $('[data-bkpk-fill-form-button]');
  save_form_button.on('click', function () {
    saveFormData(this);
  });
  fill_form_button.on('click', function () {
    fillFormData(this, forms_to_fill);
  });
}

/********************************************************/
// Storage and display functions
// The "origin" variable is the "this" from the event trigger.
/*********************************************************/

// Takes data from the selected elements and stores it in the backpack.
// edX sanitizes the data on their end via URI encoding.
function storeElementData(origin, elements, quantity) {
  console.debug(elements);
  // The thing wer're going to store.
  let data_object = {};

  // Get all the variables on the page or just one?
  if (quantity === 'all') {
    // Get everything with data-bkpk-input-for set, regardless of variable.
    let all_entries = Array.from(elements);
    console.debug(all_entries);
    let current_variables = all_entries.map(
      (x) => x.attributes['data-bkpk-input-for']
    );
    console.debug(current_variables);
    // Values for form elements, text for other HTML elements
    let current_values = all_entries.map(function (x) {
      if (x.tagName === 'INPUT') {
        return x.value;
      } else {
        return x.innerHTML;
      }
    });
    console.debug(current_values);
    for (let i = 0; i < current_values.length; i++) {
      data_object[current_variables[i]] = current_values[i];
    }
  } else if (quantity === 'one') {
    console.debug(origin);
    let varname = origin.attributes['data-bkpk-save-button'].value;
    console.debug(varname);
    let datum = $('[data-bkpk-input-for="' + varname + '"]').val();
    console.debug(datum);
    data_object[varname] = datum;
    // Get the variable name from the element that called this.
    // Store just the info from entries of that variable.
  } else {
    console.debug('bad quantity specified for storeElementData()');
  }

  // Store all of their info in the backpack.
  if (hxBackpackLoaded) {
    hxSetData(data_object);
    $('[data-bkpk-success]').show();
    $('[data-bkpk-error]').hide();
  } else {
    $('[data-bkpk-error]').show();
    console.debug('no backpack found');
  }
}

function checkForOverwrite(e){
  if (e) {
    if (e.attributes['data-bkpk-overwrite'] === 'true') {
      return true;
    }
  }
  return false;
}

// TODO: Rewrite the fillElementData function into two:
//       one that fills all elements who share a single variable,
//       and one that fills any elements that have any variable.

// Gets data from the backpack and puts it into the selected elements.
function fillElementData(origin, elements, quantity) {
  // Get all the data for this student.
  let student_data = hxGetAllData();
  console.debug(elements);
  console.debug(student_data);
  if (quantity === 'all') {
    // Fill all data elements with their data.
    elements.each(function (i, e) {
      let varname = e.attributes['data-bkpk-fill-with'].value;
      let overwrite = checkForOverwrite(e);
      insertData(origin, e, student_data, varname, overwrite);
    });
  } else if (quantity === 'one') {
    // Get the variable name from the element that called this.
    let varname = origin.attributes['data-bkpk-fill-button'];
    // Fill just the elements whose data-bkpk-input-for matches the variable.
    insertData(orgin, elements, student_data, varname, overwrite);
  } else {
    console.debug('bad quantity specified for fillElementData()');
  }
}

function clearElementData(origin, elements, quantity) {
  console.debug('clearElementData not implemented yet.');
}

function fillFormData(origin, form) {
  console.debug('fillFormData not implemented yet.');
}

function saveFormData(origin) {
  console.debug('saveFormData not implemented yet.');
}

// Logic for deciding how to fill different tag types.
function insertData(origin, element, student_data, varname, overwrite) {
  if (typeof varname !== 'undefined' && typeof student_data !== 'undefined') {
    data = student_data[varname];
    if (element.tagName === 'INPUT') {
      // Don't fill input boxes if they already have stuff in them,
      // unless there's a specific overwrite flag set.
      console.log(element.value);
      if (element.value === '' || overwrite) {
        element.value = data;
      }
    } else {
      // Here it's ok to overwrite whatever's there.
      element.innerHTML = data;
    }
  }
}
