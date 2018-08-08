// Fill your svg world map with semi-beautiful color-coded data!
// You must define the mapDataFile variable in your html component.

// Example colors from http://colorbrewer2.org/#type=sequential&scheme=YlGnBu&n=5
var colorArray =
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
    if('mapDataFile' in parent.window){
      var csvfile = parent.window.mapDataFile;
      if(csvfile.indexOf('/static/') != -1){
        csvfile = parent.window.getAssetURL(parent.window.location.href, 'complete') + csvfile;
      }

      // We're including the Papa CSV parser in the HTML,
      // so make sure it loads completely before trying to use it.
      var waitForPapa = setInterval(function(){
        console.log('waiting for CSV parser...');
        if(typeof Papa !== 'undefined'){
          Papa.parse(csvfile, {
            download: true,
            header: true,
            complete: function(results) {
              console.log(results);
              colorMap(results.data);
            }
          });
          clearInterval(waitForPapa);
        }
      }, 250);

    }else{
      console.log('Data file not specified.');
    }

}


// Take in a csv data object and color the map with it.
// Data must have a Value column, and either a Location or an ID.
function colorMap(data){
    var subdoc = $('object')[0].contentDocument;
    var svg = $(subdoc).find('svg');

    // Strip bad lines
    data = data.filter(function(n){ return n['Year'] != null; });

    // Get the list of country codes.
    // Sometimes they're specified explicitly, sometimes not.
    if(data[0]['ID']){
        var ccodes = data.map(a => a['ID']);
    }else{
        var countries = data.map(a => a.Location);
        var ccodes = [];
        countries.forEach(function(c){
            ccodes.push( countryToCode[c] );
        });
    }

    // Get the country data and normalize it.
    var values = data.map(a => Number(a.Value));
    var normVals = normalize(values);
    var colorVals = dataToColor(normVals, values);

    // Set the color fill for each country (skip blanks)
    ccodes.forEach(function(cc, i){
        if(cc){
            var targets = svg.find( '#' + cc );
            targets.css( 'fill', colorVals[i] );
            targets.find('*').css( 'fill', colorVals[i] );
        }
    });

    // Insert the key.
    addKey(values);
}


// Insert a colored key for the data.
function addKey(values){
    console.log('adding key');
    var nonZeroData = values.filter(Number);
    var maxData = Math.ceil(Math.max(...nonZeroData));
    var minData = Math.ceil(Math.min(...nonZeroData));
    var maxColor = colorArray[-1];
    var minColor = colorArray[0];

    // Here's where we're putting the key.
    var keySpot = $(parent.document).find('.mapwrapper');
    var hasKey = (keySpot.find('#datamapkey').length === 1);
    if(hasKey){ keySpot.find('#datamapkey').remove(); }
    var theKey = $('<div id="datamapkey"></div>');
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
    var whiteKey = $('<div/>');
    whiteKey.html('White: value is zero ');
    whiteKey.css({
            'display': 'inline-block',
            'text-align': 'right',
            'width': '50%',
            'padding': '4px',
            'box-sizing': 'border-box'
        });
    var whiteBox = $('<div/>');
    whiteBox.css({
            'display': 'inline-block',
            'width': '1em',
            'height': '1em',
            'background-color': 'white',
            'border': '1px solid black'
        });
    whiteKey.append(whiteBox);

    var greyKey = $('<div/>');
    greyKey.html(' Grey: no data');
    greyKey.css({
            'display': 'inline-block',
            'text-align': 'left',
            'width': '50%',
            'padding': '4px',
            'box-sizing': 'border-box'
        });
    var greyBox = $('<div/>');
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
    var max = Math.max(...data);
    var min = Math.min(...data);
    var newData = [];
    for(let i = 0; i < data.length; i++){
        newData[i] = (data[i] - min)/(max - min);
    }
    return newData;
}

// Take in an array of normalized data.
// Return an array of appropriate web colors.
function dataToColor(data, originalData){
    var hexData = [];

    for(let i = 0; i < data.length; i++){

        // We're mapping 0-1 decimal range to a set of colors.
        hexData[i] = colorArray[ Math.floor(data[i] * 7) ];
        if(originalData[i] == 0){ hexData[i] = '#ffffff'; }  // Set actual zero to white
        if(data[i] == 1){ hexData[i] = colorArray[6]; }      // Set highest to dark

        /*************************************/
        // Old approach. Didn't work as well.
        /*************************************/

        // var red   = parseInt(data[i] * (25 - 255) + 255).toString(16);
        // var green = parseInt(data[i] * (34 - 255) + 255).toString(16);
        // var blue  = parseInt(data[i] * (94 - 204) + 204).toString(16);

        // Need leading zeroes.
        // if(red.length   == 1 ) { red =   '0' + red;   }
        // if(green.length == 1 ) { green = '0' + green; }
        // if(blue.length  == 1 ) { blue =  '0' + blue;  }

        // hexData[i] = '#' + red + green + blue;
    }
    return hexData;
}

var countryToCode = {
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
