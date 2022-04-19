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

The following are for messaging:

data-bkpk-loading="true" - you can put a "loading" message in this element.
data-bkpk-error="true" - you can put a "failed to load" message in this element.
data-bkpk-success="true" - you can put an "it loaded" message in this element.
data-wait-for-bkpk="true" - put this on disabled elements. They will enable when it loads.
You should hide the error and success elements with display:none. They'll be shown later.

TROUBLESHOOTING:
- Most common issue: Did the student agree to the honor code?
- If there are multiple elements on a page with the same variable name, it'll only store the first one.

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
      console.debug('Done loading');
      if(hx_better_backpack_first_load){
        hx_better_backpack_first_load = false;
        setListeners();
      }
      $('[data-bkpk-success]').show();
      $('[data-bkpk-loading]').hide();
      $('[data-bkpk-success]').prop('disabled', false);

      // TODO: Add a timeout to say "backpack hasn't loaded"
    }
  }, 250);
}

function setListeners() {

  let input_elements = $('[data-bkpk-input-for]');
  let save_buttons = $('[data-bkpk-save-button]');
  let save_all_buttons = $('[data-bkpk-save-all-button]');
  save_buttons.on('click', function () {
    storeElementData(this, input_elements, 'one');
  });
  save_all_buttons.on('click', function () {
    storeElementData(this, input_elements, 'all');
  });

  let elements_to_fill = $('[data-bkpk-fill-with]');
  let fill_buttons = $('[data-bkpk-fill-button]');
  let fill_all_buttons = $('[data-bkpk-fill-all-button]');
  fill_buttons.on('click', function () {
    fillElements(this);
  });
  fill_all_buttons.on('click', function () {
    let overwrite = checkForOverwrite(origin);
    fillAllElements(overwrite);
  });

  let clear_buttons = $('[data-bkpk-clear]');
  let clear_all_buttons = $('[data-bkpk-clear-all]');
  clear_buttons.on('click', function () {
    clearData(this);
  });
  clear_all_buttons.on('click', function () {
    clearAllData(this);
  });

  // When the backpack loads, fill all the data-bkpk-fill elements,
  // and overwrite what's currently in there.
  fillAllElements(true);

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

// Should we be overwriting the existing data in our elements?
function checkForOverwrite(e) {
  if (e) {
    if (e.attributes['data-bkpk-overwrite'].value === 'true') {
      return true;
    }
  }
  return false;
}

// Fill all elements for all variables.
function fillAllElements(overwrite) {
  let elements;
  let all_student_data = hxGetAllData();
  let k = Object.keys(all_student_data);
  k.forEach(function (varname, i) {
    elements = $('[data-bkpk-fill-with="' + varname + '"]');
    elements.each(function (j, x) {
      insertData(x, all_student_data[varname], overwrite);
    });
  });
}

// Fill all the elements for one particular variable.
function fillElements(origin) {
  let varname = origin.attributes['data-bkpk-fill-button'].value;
  let overwrite = checkForOverwrite(origin);
  let student_datum = hxGetData(varname);
  let elements = $('[data-bkpk-fill-with="' + varname + '"]');
  elements.each(function (i, e) {
    insertData(e, student_datum, overwrite);
  });
}

// Clears the data for one particular variable.
function clearData(origin) {
  console.debug('clearElementData not implemented yet.');
}

// Clears data for all variables that are present on this page.
// DOES NOT CLEAR THE ENTIRE BACKPACK.
function clearAllData(origin) {
  console.debug('clearElementData not implemented yet.');
}


// TODO: Build tagName check into checkForOverwrite function instead of here.

// Logic for deciding how to fill different tag types.
function insertData(element, data, overwrite) {
  if (element) {
    if (data) {
      if (element.tagName === 'INPUT') {
        // Don't fill input boxes if they already have stuff in them,
        // unless there's a specific overwrite flag set.
        if (element.value === '' || overwrite) {
          element.value = data;
        }
      } else {
        // Here it's ok to overwrite whatever's there.
        element.innerHTML = data;
      }
    }
    else{
      console.debug('no data to add');
    }
  }
  else{
    console.debug('no element specified');
  }
}
