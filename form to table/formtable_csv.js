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
      }
    }, 250);
  } else {
    console.log('Data file not specified.');
  }

  $('#reloadTable').on('click tap', function() {
    $('#responseTable').empty();
    loadNewData(sourceDataFile);
  });
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

      // Strip lines without links entered
      let data = results.data.filter(function(n) {
        // console.log(n);
        let ret = false;
        $.each(n, function(k) {
          if (k.toLowerCase().indexOf('url') !== -1) {
            // Make sure the link is actually present. No blanks.
            if (n[k] !== '') {
              ret = true;
            }
          }
        });
        return ret;
      });

      setUpDataTable(data);
      return data;
    }
  });
}

function shortenText(text, n) {
  if (text.indexOf('https://courses.edx.org/courses') !== -1) {
    return (
      'https://courses.edx' + '...' + text.split('/')[4].split(':')[1] + '...'
    );
  } else {
    if (text.length < n) {
      return text;
    } else {
      return text.slice(0, n - 3) + '...';
    }
  }
}

// Show only rows with text that matches the text in the filter.
function filterColumn(column, filterText) {
  console.log('Filtering column ' + column + ' on ' + filterText);

  // Split the filterText by commas. Drop whitespace.
  let filtersArray = filterText.split(',');
  filtersArray = filtersArray.map(e => e.trim());
  filtersArray = filtersArray.filter(e => e !== '');
  // console.log(filtersArray);

  // If the input is blank, show all authors and be done.
  if (filtersArray.length === 0) {
    $('#responseTable tr').show();
  } else {
    // Hide every row beyond the first two.
    var dataRows = $('#responseTable tr').filter(function(i, e) {
      return i > 1;
    });
    dataRows.hide();
    filtersArray.forEach(function(ft) {
      // Show any columns whose data matches the filter text.
      dataRows
        .filter(function(i, e) {
          // console.log(i, column);
          // console.log($(e).find(':nth-child(' + (column + 1) + ')'));
          let cell = $(e).find(':nth-child(' + (column + 1) + ')');
          let cellText = cell[0].innerText.toLowerCase();
          let cellHasText = cellText.indexOf(ft.toLowerCase()) !== -1;
          return cellHasText;
        })
        .show();
    });
  }
}

// Create a data table for accessibility purposes.
function setUpDataTable(data) {
  console.log('Setting up data table.');
  console.log(data);
  let dataKeys = Object.keys(data[0]);
  let dataHeaders = [];
  let dataMap = {};

  if ('sourceDataHeaders' in window) {
    dataKeys = Object.keys(sourceDataHeaders);
    dataHeaders = dataKeys.map(e => sourceDataHeaders[e]);
    dataMap = sourceDataHeaders;
  } else {
    dataHeaders = dataKeys;
    dataHeaders.forEach((k, i) => (dataKeys[idx] = dataMap[k]));
  }

  // console.log('keys:');
  // console.log(dataKeys);
  //
  // console.log('headers:');
  // console.log(dataHeaders);
  //
  // console.log('map:');
  // console.log(dataMap);

  let dataTable = $('#responseTable');

  // Set up header rows.
  let header = $('<tr/>');
  dataHeaders.forEach(k => {
    header.append('<th scope="col">' + k + '</th>');
  });
  dataTable.append(header);

  // Set up filter rows
  let filter_row = $('<tr/>');
  dataHeaders.forEach((k, i) => {
    let filter_box = $(
      '<td><label class="sr" for="' +
        k +
        '_filter">Filter for ' +
        k +
        ' </label><input placeholder="Search..." type="text" id="' +
        k +
        '_filter"></td>'
    );
    filter_row.append(filter_box);
    filter_box.on('input', function(e) {
      filterColumn(i, e.target.value);
    });
  });
  dataTable.append(filter_row);

  // Loop through data and create the data rows.
  data.forEach(function(row) {
    let rowHTML = $('<tr/>');
    dataKeys.forEach(k => {
      // console.log(dataMap[k]);
      // console.log(dataMap[k]);
      if (
        dataMap[k].toLowerCase() === 'url' ||
        dataMap[k].toLowerCase() === 'link'
      ) {
        // If it's a link, link it.
        rowHTML.append(
          '<td>' +
            '<a href="' +
            row[k] +
            '" target="_blank">' +
            shortenText(row[k], 40) +
            '</a>' +
            '</td>'
        );
      } else {
        rowHTML.append('<td>' + row[k] + '</td>');
      }
    });
    dataTable.append(rowHTML);
  });
}
