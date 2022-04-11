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
data-backpack-fill="varname" - fills "autofill" items when clicked.
data-backpack-clear="varname" - removes the value from the backpack.

There are also "-all" variants for save, fill, and clear, like
data-backpack-save-all-button, that act on all elements on the page regardless
of their variable names.

data-backpack-loading="true" - you can put a "loading" message in this element.
data-backpack-error="true" - you can put a "failed to load" message in this element.
data-backpack-success="true" - you can put an "it loaded" message in this element.
data-wait-for-backpack="true" - put this on disabled elements. They will enable when it loads.
You should hide the error and success elements with display:none. They'll be shown later.

TROUBLESHOOTING:
- Most common issue: Did the student agree to the honor code?
- If there are multiple elements on a page with the same variable name, it'll only store the first one.

The following items are intended for later expansion:
---------------
data-backpack-save-form="varname" - saves all the data from this form, serialized.
data-backpack-autofill-form="varname" - like "autofill" above.
data-backpack-fill-form="varname" - like "fill" above.

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
      $('[data-backpack-error]').show();
      $('[data-backpack-loading]').hide();
    }
    if (hxBackpackLoaded) {
      clearInterval(wait_for_backpack);
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
  fillElementData(null, elements_to_autofill, 'all');
  fillFormData(null, forms_to_fill);

  let elements_to_store = $('[data-backpack-entry]');
  let save_buttons = $('[data-backpack-save-button]');
  let save_all_buttons = $('[data-backpack-save-all-button]');
  save_buttons.on('click', function () {
    storeElementData(this, elements_to_store, 'one');
  });
  save_all_buttons.on('click', function () {
    storeElementData(this, elements_to_store, 'all');
  });

  let fill_buttons = $('[data-backpack-fill]');
  let fill_all_buttons = $('[data-backpack-fill-all]');
  fill_buttons.on('click', function () {
    fillElementData(this, elements_to_autofill, 'one');
  });
  fill_all_buttons.on('click', function () {
    fillElementData(this, elements_to_autofill, 'all');
  });

  let clear_buttons = $('[data-backpack-clear]');
  let clear_all_buttons = $('[data-backpack-clear-all]');
  clear_buttons.on('click', function () {
    clearData(this, 'one');
  });
  clear_all_buttons.on('click', function () {
    clearData(this, 'all');
  });

  let save_form_button = $('[data-backpack-save-form]');
  let fill_form_button = $('[data-backpack-fill-form]');
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
    // Get everything with data-backpack-entry set, regardless of variable.
    let all_entries = Array.from(elements);
    console.debug(all_entries);
    let current_variables = all_entries.map(
      (x) => x.attributes['data-backpack-entry']
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
    let varname = origin.attributes['data-backpack-save-button'].value;
    console.debug(varname);
    let datum = $('[data-backpack-entry="' + varname + '"]').val();
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
    $('[data-backpack-success]').show();
    $('[data-backpack-error]').hide();
  } else {
    $('[data-backpack-error]').show();
    console.debug('no backpack found');
  }
}

// Gets data from the backpack and puts it into the selected elements.
function fillElementData(origin, elements, quantity) {
  // Get all the data for this student.
  let student_data = hxGetAllData();
  console.debug(student_data);
  if (quantity === 'all') {
    // Fill all data elements with their data.
    elements.each(function (i, e, student_data) {
      console.debug(e);
      let varname = e.attributes['data-backpack-entry'];
      insertData(origin, e, student_data, varname);
    });
  } else if (quantity === 'one') {
    // Get the variable name from the element that called this.
    let varname = origin.attributes['data-backpack-entry'];
    // Fill just the elements whose data-backpack-entry matches the variable.
    insertData(orgin, origin, student_data, varname);
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
function insertData(origin, element, student_data, varname) {
  if (typeof varname !== 'undefined' && typeof student_data !== 'undefined') {
    data = student_data[varname];
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
}
