// Build a table with learner-submitted links and text!
// You must define the sourceDataFile variable in your html component.
// Use one table per page or you'll accidentally overwrite all of them
// every time you load new data.

$(document).ready(function() {
  console.log('Data loader ready');

  // Bring in the CSV file.
  if ('sourceDataFile' in window) {
    // We're including the Papa CSV parser in the HTML,
    // so make sure it loads completely before trying to use it.
    let waitForPapa = setInterval(function() {
      console.log('waiting for CSV parser...');
      if (typeof Papa !== 'undefined') {
        clearInterval(waitForPapa);
        loadNewData(sourceDataFile);
        // setUpControls();
      }
    }, 250);
  } else {
    console.log('Data file not specified.');
  }
});

// Loads data from CSV files
function loadNewData(filename) {
  console.log('Loading new data.');
  if (filename.indexOf('/static/') != -1) {
    filename = getAssetURL(location.href, 'complete') + filename;
  }
  Papa.parse(filename, {
    download: true,
    header: true,
    complete: function(results) {
      console.log(results);

      // Lowercase all the spreadsheet headers.
      resultsLC = results.data.map(function(row) {
        let newRow = {};
        Object.keys(row).forEach(function(k) {
          newRow[k.toLowerCase()] = row[k];
        });
        return newRow;
      });

      // Strip lines without links entered
      let data = resultsLC.filter(function(n) {
        if ('link url' in n) {
          return true;
        } else {
          return false;
        }
      });

      setUpDataTable(data);
      return data;
    }
  });
}

/*
// Filter and sort table columns
function setUpControls(datafiles) {
  console.log('Setting up data table controls.');
  // If there's only one data file, skip this.
  if (datafiles.length === 1) {
    return false;
  }

  // If we've already got a dropdown, skip this.
  let hasDropDown = $(document).find('#map-data-dropdown').length > 0;
  if (hasDropDown) {
    return;
  }

  let wrapper = $(document).find('.mapwrapper');
  let form = $('<form id="map-data-dropdown"/>');
  let fieldset = $('<fieldset/>');

  let datalabel = $('<label for="mapdatapicker">Select map data: </label>');

  let sel = $('<select name="mapdatapicker" id="mapdatapicker"></select>');

  for (let i = 0; i < datafiles.length; i++) {
    let opt = $('<option>');
    opt.text(datafiles[i].name);
    sel.append(opt);
  }

  wrapper
    .append(form)
    .append(fieldset)
    .append(datalabel)
    .append(sel);

  // Add dropdown listener.
  sel.on('change', function() {
    let newName = this.value;
    let newData = datafiles.find(x => x.name === newName).filename;

    // Recolor the map.
    loadNewMapData(newData);

    // Change the download link and (possibly) map title.
    let downloadLink = $(document).find('#map_data_download');
    let mapTitle = $(document).find('#map_title');
    downloadLink.text(newName);
    mapTitle.text(newName);
    downloadLink.prop('href', newData);
  });

  return true;
}
*/

// Create a data table for accessibility purposes.
function setUpDataTable(data) {
  console.log('Setting up data table.');
  console.log(data);
  let dataHeaders = [];

  if ('sourceDataHeaders' in window) {
    dataHeaders = Object.entries(sourceDataHeaders).map(e => e[1]);
  } else {
    dataHeaders = Object.keys(data[0]);
  }

  console.log('headers:');
  console.log(dataHeaders);

  let dataTable = $('#responseTable');

  // Set up header rows.
  let header = $('<tr/>');
  dataHeaders.forEach(h => {
    header.append('<th scope="col">' + h + '</th>');
  });
  dataTable.append(header);

  /*
  // Loop through data and create the data rows.
  let sortedData = sortByCountry(data);
  sortedData.forEach(function(row) {
    let rowHTML = $('<tr/>');
    rowHTML.append('<td>' + row.location + '</td>');
    rowHTML.append('<td>' + Number(row.value).toFixed(1) + '</td>');
    dataTable.append(rowHTML);
  });

  toggleButton.insertAfter(wrapper);
  dataTable.insertAfter(toggleButton);
  */
}
