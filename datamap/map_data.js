// Fill your svg world map with semi-beautiful color-coded data!
// You must define the mapDataFiles variable in your html component.
// Use one map per page or you'll accidentally overwrite all of them
// every time you load new data.

// Example colors from http://colorbrewer2.org/#type=sequential&scheme=YlGnBu&n=5
let colorArray =
['#ffffd9',
'#edf8b1',
'#c7e9b4',
'#7fcdbb',
'#41b6c4',
'#1d91c0',
'#225ea8'];


// Called by the map's <object> tag when it's done loading.
function mapReady(){
    console.log('Map ready');

    // Bring in the CSV file.
    if('mapDataFiles' in parent.window){
        let csvfile = parent.window.mapDataFiles[0].filename;

        // We're including the Papa CSV parser in the HTML,
        // so make sure it loads completely before trying to use it.
        let waitForPapa = setInterval(function(){
            console.log('waiting for CSV parser...');
            if(typeof Papa !== 'undefined'){
                clearInterval(waitForPapa);
                loadNewMapData(csvfile);
                setUpDropDown(parent.window.mapDataFiles);
                setUpOpenLarge();
            }
        }, 250);

    }else{
        console.log('Data file not specified.');
    }

}

// Loads map data from CSV files
function loadNewMapData(filename){
    console.log('Loading new map data.')
    if(filename.indexOf('/static/') != -1){
        filename = parent.window.getAssetURL(parent.window.location.href, 'complete') + filename;
    }
    Papa.parse(filename, {
        download: true,
        header: true,
        complete: function(results) {
            console.log(results);

            // Lowercase all the spreadsheet headers.
            resultsLC = results.data.map(function(row){
                let newRow = {};
                Object.keys(row).forEach(function(k){
                    newRow[k.toLowerCase()] = row[k];
                });
                return newRow;
            });

            // Strip lines without value, or without either ID or location
            let data = resultsLC.filter(function(n){
                if('value' in n && ( 'id' in n || 'location' in n)){
                    return true;
                }
                else{ return false; }
            });

            colorMap(data);
            setUpDataTable(data);
            return(data);
        }
    });
}

// Dropdown menu to select data file
function setUpDropDown(datafiles){
    console.log('Setting up dropdown.')
    // If there's only one data file, skip this.
    if(datafiles.length === 1){
        return false;
    }

    // If we've already got a dropdown, skip this.
    let hasDropDown = $(parent.document).find('#map-data-dropdown').length > 0;
    if(hasDropDown){ return; }

    let wrapper = $(parent.document).find('.mapwrapper');
    let form = $('<form id="map-data-dropdown"/>');
    let fieldset = $('<fieldset/>');

    let datalabel = $('<label for="mapdatapicker">Select map data: </label>');

    let sel = $('<select name="mapdatapicker" id="mapdatapicker"></select>');

    for(let i=0; i < datafiles.length; i++){
        let opt = $('<option>');
        opt.text(datafiles[i].name);
        sel.append(opt);
    }

    wrapper.append(form)
        .append(fieldset)
        .append(datalabel)
        .append(sel);

    // Add dropdown listener.
    sel.on('change', function(){
        let newName = this.value;
        let newData = datafiles.find(x => x.name === newName).filename;

        // Recolor the map.
        loadNewMapData(newData);

        // Change the download link and (possibly) map title.
        let downloadLink = $(parent.document).find('#map_data_download');
        let mapTitle = $(parent.document).find('#map_title');
        downloadLink.text(newName);
        mapTitle.text(newName);
        downloadLink.prop('href', newData);
    });

    return true;

}

// Create a data table for accessibility purposes.
function setUpDataTable(data){
    console.log('Setting up data table.')
    // If there's already a data table, get rid of it.
    let existingTable = $(parent.document).find('#hx-mapdatatable');
    let existingTableButton = $(parent.document).find('#hx-maptablebutton');
    // Keep table expanded/collapsed status.
    let tableWasVisible = (existingTableButton.attr('aria-expanded') === 'true');
    let tableDisplayMode = tableWasVisible ? 'table' : 'none';

    if(existingTable.length > 0){ existingTable.remove(); }
    if(existingTableButton.length > 0){ existingTableButton.remove(); }

    let wrapper = $(parent.document).find('.mapwrapper');
    // We're giving the data tables high random IDs
    // so they don't interfere with other collapsible items.
    let tableID = Math.floor((Math.random() * 1000) + 1000);
    let toggleButton = $('<button id="hx-maptablebutton" class="hx-maptablebutton' + tableID + '">Show/Hide Data Table</button>');
    let dataTable = $('<table id="hx-mapdatatable" class="hx-maptable' + tableID + '" style="display:' + tableDisplayMode + ';">')
    let caption = $('<caption style="font-size: 18px; font-weight:bold;">Map Data Table</caption>')
    dataTable.append(caption);

    // Set up header rows. Use location and value.
    // If we have id rather than location, use the lookup table.
    let header = $('<tr/>');
    header.append('<th scope="col">Location</th>');
    header.append('<th scope="col">Value</th>');
    dataTable.append(header);

    // Loop through data and create the data rows.
    let sortedData = sortByCountry(data);
    sortedData.forEach(function(row){
        let rowHTML = $('<tr/>');
        rowHTML.append('<td>' + row.location + '</td>');
        rowHTML.append('<td>' + Number(row.value).toFixed(1) + '</td>');
        dataTable.append(rowHTML);
    });

    toggleButton.insertAfter(wrapper);
    dataTable.insertAfter(toggleButton);

    // Add listeners as per HX-JS;
    parent.window.prepAccessibleToggles('hx-maptablebutton', 'hx-maptable');

}

// An "open in new window" button, kind of.
// Not currently working due to various issues.
// New approach for next time:
// * Add button INSIDE the iframe
// * Call functions OUTSIDE the iframe to make modal dialog.
// * (remove button while modal?)
function setUpOpenLarge(){

  console.log('Setting up open-large button.')

  let wrapper = $('#innerwrapper');
  let openLargeButton = $('#LargeMapView');

  if(openLargeButton.length > 0){
    console.log('got button already');
  }else{
    console.log('no button so far');
    openLargeButton = $('<button id="LargeMapView"></button>');
    openLargeButton.text('View Large');
    wrapper.prepend(openLargeButton);
  }

  openLargeButton.on('click tap', function(){ parent.popDataMap() });

}

// Sort our data by country. Also, make sure it has a location.
function sortByCountry(data){

    // If we have country ID codes, replace location with the "official" name
    data.forEach(function(row){
        if('id' in row){
            row.location = codeToCountry[row['id']];
        }
    });

    // Sorting comparison function
    function compareLocations(a,b){
        if(a.location < b.location){ return -1; }
        if(a.location > b.location){ return 1; }
        return 0;
    }

    let sortedData = data.sort(compareLocations);
    console.log(sortedData);
    return sortedData;

}

// Take in a csv data object and color the map with it.
// Data must have a value column, and either a location or an ID.
function colorMap(data){
    console.log('Coloring the map.')
    let subdoc = $('object')[0].contentDocument;
    let svg = $(subdoc).find('svg');
    let ccodes = [];

    // Get the list of country codes.
    // Sometimes they're specified explicitly, sometimes not.
    if(typeof data[0] !== 'undefined'){
        if('id' in data[0]){
            ccodes = data.map(a => a['id']);
        }else{
            let countries = data.map(a => a.location);
            countries.forEach(function(c){
                ccodes.push( countryToCode[c] );
            });
        }
    }else{
        console.log('Data undefined - check your spreadsheet headers.');
    }

    // Get the country data and normalize it.
    let values = data.map(a => Number(a.value));
    let normVals = normalize(values);
    let colorVals = dataToColor(normVals, values);

    // Set the color fill for each country (skip blanks)
    ccodes.forEach(function(cc, i){
        if(cc){
            let targets = svg.find( '#' + cc );
            targets.css( 'fill', colorVals[i] );
            targets.find('*').css( 'fill', colorVals[i] );
        }
    });

    // Insert the key.
    addKey(values);
}


// Insert a colored key for the data.
function addKey(values){
    console.log('Adding key.');
    let nonZeroData = values.filter(Number);
    let maxData = Math.ceil(Math.max(...nonZeroData));
    let minData = Math.ceil(Math.min(...nonZeroData));
    let maxColor = colorArray[-1];
    let minColor = colorArray[0];

    // Here's where we're putting the key.
    let keySpot = $(parent.document).find('.mapwrapper');
    let hasKey = (keySpot.find('#datamapkey').length === 1);
    if(hasKey){ keySpot.find('#datamapkey').remove(); }
    let theKey = $('<div id="datamapkey"></div>');
    keySpot.append(theKey);

    let minText = $('<div/>');
    minText.html('Min:&nbsp;' + minData);
    minText.css('float','left');
    minText.css('width','50%');

    let maxText = $('<div/>');
    maxText.html('Max:&nbsp;' + maxData);
    maxText.css('text-align','right');
    maxText.css('float','right');
    minText.css('width','50%');

    theKey.append(minText);
    theKey.append(maxText);
    theKey.append('<br clear="all" />');


    // Colored elements for key
    for(let i = 0; i < colorArray.length; i++){
        let thisBlock = $('<div/>');
        thisBlock.css('display', 'inline-block');
        thisBlock.css('width', 100/(colorArray.length) + '%');

        let bottomPart = $('<div/>');
        bottomPart.css('height', '10px');
        bottomPart.css('background-color', colorArray[i]);
        bottomPart.css('border','1px solid black');
        thisBlock.append(bottomPart);

        theKey.append(thisBlock);
    }

    // White and grey elements for key
    let whiteKey = $('<div/>');
    whiteKey.html('White: value is zero ');
    whiteKey.css({
        'display': 'inline-block',
        'text-align': 'right',
        'width': '50%',
        'padding': '4px',
        'box-sizing': 'border-box'
    });
    let whiteBox = $('<div/>');
    whiteBox.css({
        'display': 'inline-block',
        'width': '1em',
        'height': '1em',
        'background-color': 'white',
        'border': '1px solid black'
    });
    whiteKey.append(whiteBox);

    let greyKey = $('<div/>');
    greyKey.html(' Grey: no data');
    greyKey.css({
        'display': 'inline-block',
        'text-align': 'left',
        'width': '50%',
        'padding': '4px',
        'box-sizing': 'border-box'
    });
    let greyBox = $('<div/>');
    greyBox.css({
        'display': 'inline-block',
        'width': '1em',
        'height': '1em',
        'background-color': '#e0e0e0',
        'border': '1px solid black'
    });
    greyKey.prepend(greyBox);

    theKey.append('<br/>');
    theKey.append(whiteKey);
    theKey.append(greyKey);
}


// Take in an array of numerical data.
// Return a normalized array.
function normalize(data){
    let max = Math.max(...data);
    let min = Math.min(...data);
    let newData = [];
    for(let i = 0; i < data.length; i++){
        newData[i] = (data[i] - min)/(max - min);
    }
    return newData;
}

// Take in an array of normalized data.
// Return an array of appropriate web colors.
function dataToColor(data, originalData){
    let hexData = [];

    for(let i = 0; i < data.length; i++){

        // We're mapping 0-1 decimal range to a set of colors.
        hexData[i] = colorArray[ Math.floor(data[i] * 7) ];
        if(originalData[i] == 0){ hexData[i] = '#ffffff'; }  // Set actual zero to white
        if(data[i] == 1){ hexData[i] = colorArray[6]; }      // Set highest to dark

        /*************************************/
        // Old approach. Didn't work as well.
        /*************************************/

        // let red   = parseInt(data[i] * (25 - 255) + 255).toString(16);
        // let green = parseInt(data[i] * (34 - 255) + 255).toString(16);
        // let blue  = parseInt(data[i] * (94 - 204) + 204).toString(16);

        // Need leading zeroes.
        // if(red.length   == 1 ) { red =   '0' + red;   }
        // if(green.length == 1 ) { green = '0' + green; }
        // if(blue.length  == 1 ) { blue =  '0' + blue;  }

        // hexData[i] = '#' + red + green + blue;
    }
    return hexData;
}

let countryToCode = {
    "South Sudan": "ss",
    "Georgia": "ge",
    "Abkhazia": "xa",
    "South Ossetia": "xo",
    "Peru": "pe",
    "Burkina Faso": "bf",
    "France": "fr",
    "Guadeloupe": "gp",
    "Martinique": "mq",
    "Reunion": "re",
    "Mayotte": "yt",
    "French Guiana": "gf",
    "Libya": "ly",
    "Belarus": "by",
    "Pakistan": "pk",
    "Azad Kashmir": "qm",
    "Indonesia": "id",
    "Yemen": "ye",
    "Madagascar": "mg",
    "Bolivia": "bo",
    "Serbia": "rs",
    "Kosovo": "xk",
    "Cote d'Ivoire": "ci",
    "Algeria": "dz",
    "Switzerland": "ch",
    "Cameroon": "cm",
    "Macedonia": "mk",
    "Botswana": "bw",
    "Kenya": "ke",
    "Jordan": "jo",
    "Mexico": "mx",
    "United Arab Emirates": "ae",
    "Belize": "bz",
    "Brazil": "br",
    "Sierra Leone": "sl",
    "Mali": "ml",
    "Democratic Republic of the Congo": "cd",
    "Italy": "it",
    "Somalia": "so",
    "Somaliland": "xs",
    "Afghanistan": "af",
    "Bangladesh": "bd",
    "Dominican Republic": "do",
    "Guinea-Bissau": "gw",
    "Ghana": "gh",
    "Austria": "at",
    "Sweden": "se",
    "Turkey": "tr",
    "Uganda": "ug",
    "Mozambique": "mz",
    "Japan": "jp",
    "New Zealand": "nz",
    "Cuba": "cu",
    "Venezuela": "ve",
    "Portugal": "pt",
    "Colombia": "co",
    "Mauritania": "mr",
    "Angola": "ao",
    "Germany": "de",
    "Thailand": "th",
    "Australia": "au",
    "Papua New Guinea": "pg",
    "Iraq": "iq",
    "Croatia": "hr",
    "Greenland": "gl",
    "Niger": "ne",
    "Denmark": "dk",
    "Latvia": "lv",
    "Romania": "ro",
    "Zambia": "zm",
    "Myanmar": "mm",
    "Ethiopia": "et",
    "Guatemala": "gt",
    "Suriname": "sr",
    "Czech Republic": "cz",
    "Chad": "td",
    "Albania": "al",
    "Finland": "fi",
    "Syria": "sy",
    "Kyrgyzstan": "kg",
    "Solomon Islands": "sb",
    "Oman": "om",
    "Panama": "pa",
    "Argentina": "ar",
    "United Kingdom": "gb",
    "Costa Rica": "cr",
    "Paraguay": "py",
    "Guinea": "gn",
    "Ireland": "ie",
    "Nigeria": "ng",
    "Tunisia": "tn",
    "Poland": "pl",
    "Namibia": "na",
    "South Africa": "za",
    "Egypt": "eg",
    "Tanzania": "tz",
    "Saudi Arabia": "sa",
    "Vietnam": "vn",
    "Russian Federation": "ru",
    "Crimea": "qr",
    "Haiti": "ht",
    "Bosnia and Herzegovina": "ba",
    "India": "in",
    "China": "cn",
    "Hong Kong": "hk",
    "Macao": "mo",
    "Taiwan": "tw",
    "Canada": "ca",
    "El Salvador": "sv",
    "Guyana": "gy",
    "Belgium": "be",
    "Equatorial Guinea": "gq",
    "Lesotho": "ls",
    "Bulgaria": "bg",
    "Burundi": "bi",
    "Djibouti": "dj",
    "Azerbaijan": "az",
    "Nagorno-Karabakh": "xn",
    "Iran": "ir",
    "Malaysia": "my",
    "Philippines": "ph",
    "Uruguay": "uy",
    "Congo": "cg",
    "Montenegro": "me",
    "Estonia": "ee",
    "Rwanda": "rw",
    "Armenia": "am",
    "Senegal": "sn",
    "Togo": "tg",
    "Spain": "es",
    "Gabon": "ga",
    "Hungary": "hu",
    "Malawi": "mw",
    "Tajikistan": "tj",
    "Cambodia": "kh",
    "South Korea": "kr",
    "Honduras": "hn",
    "Iceland": "is",
    "Nicaragua": "ni",
    "Chile": "cl",
    "Morocco": "ma",
    "Western Sahara": "eh",
    "Sahrawi Arab Democratic Republic (Free Zone)": "xz",
    "Liberia": "lr",
    "Netherlands": "nl",
    "Bonaire, Sint Eustatius and Saba": "bq",
    "Central African Republic": "cf",
    "Slovakia": "sk",
    "Lithuania": "lt",
    "Zimbabwe": "zw",
    "Sri Lanka": "lk",
    "Israel": "il",
    "Palestine": "ps ",
    "Gaza Strip (State of Palestine)": "gaza_strip",
    "West Bank (State of Palestine)": "west_bank",
    "Laos": "la",
    "North Korea": "kp",
    "Greece": "gr",
    "Turkmenistan": "tm",
    "Ecuador": "ec",
    "Benin": "bj",
    "Slovenia": "si",
    "Norway": "no",
    "Moldova": "md",
    "Transnistria": "xp",
    "Ukraine": "ua",
    "Donetsk People's Republicd": "xd",
    "Luhansk People's Republic": "xl",
    "Lebanon": "lb",
    "Nepal": "np",
    "Eritrea": "er",
    "United States": "us",
    "Kazakhstan": "kz",
    "French Southern Territories": "tf",
    "Antarctica": "aq",
    "Swaziland": "sz",
    "Uzbekistan": "uz",
    "Mongolia": "mn",
    "Bhutan": "bt",
    "New Caledonia": "nc",
    "Fiji": "fj",
    "Kuwait": "kw",
    "Timor-Leste": "tl",
    "The Bahamas": "bs",
    "Vanuatu": "vu",
    "Falkland Islands (Malvinas)": "fk",
    "South Georgia and the South Sandwich Islands": "gs",
    "The Gambia": "gm",
    "Qatar": "qa",
    "Jamaica": "jm",
    "Cyprus": "cy",
    "Northern Cyprus": "xc",
    "Puerto Rico": "pr",
    "Brunei": "bn",
    "Trinidad and Tobago": "tt",
    "Cape Verde": "cv",
    "French Polynesia": "pf",
    "Samoa": "ws",
    "Luxembourg": "lu",
    "Comoros": "km",
    "Mauritius": "mu",
    "Faroe Islands": "fo",
    "Sao Tome and Principe": "st",
    "Virgin Islands, U.S.": "vi",
    "Curacao": "cw",
    "Dominica": "dm",
    "Tonga": "to",
    "Kiribati": "ki",
    "Federated States of Micronesia": "fm",
    "Andorra": "ad",
    "Palau": "pw",
    "Antigua and Barbuda": "ag",
    "Barbados": "bb",
    "Turks and Caicos Islands": "tc",
    "Saint Vincent and the Grenadines": "vc",
    "Grenada": "gd",
    "Maldives": "mv",
    "Saint Kitts and Nevis": "kn",
    "Montserrat": "ms",
    "Niue": "nu",
    "Cook Islands": "ck",
    "Wallis and Futuna": "wf",
    "Marshall Islands": "mh",
    "Liechtenstein": "li",
    "Virgin Islands, British": "vg",
    "Saint Helena, Ascension and Tristan Da Cunha": "sh",
    "Anguilla": "ai",
    "Guernsey": "gg",
    "Bermuda": "bm",
    "Nauru": "nr",
    "Pitcairn": "pn",
    "Holy See (Vatican City State)": "va",
    "Guam": "gu",
    "Norfolk Island": "nf",
    "Seychelles": "sc",
    "Saint Lucia": "lc",
    "Singapore": "sg",
    "Bahrain": "bh",
    "Malta": "mt",
    "Northern Mariana Islands": "mp",
    "Sudan": "sd",
    "American Samoa": "as"
};

let codeToCountry = {};
Object.keys(countryToCode).forEach(function(c){
    codeToCountry[countryToCode[c]] = c;
});
