## Dynamic Text Slider

Here's what you need to do:

1. Make a CSV file made with headers similar to the `ClimateImpactExplorer.csv` file shown as an example in this directory.
2. Upload the `papaparse.js`, `hx-text-slider.css`, and `hx-text-slider.js` files to Files & Uploads. The first one is the parser for CSV files.
3. Copy the HTML from `Slider Test.html` into a Raw HTML component in edX.

You'll see a version of the slider, though with broken icon links.

To change the source file, go into the HTML and change the line that says `var slidesFile = "/static/ClimateImpactExplorer.csv";` to something else.

Here's what the required columns in the data file are for:
* ID - Does not appear, but is used in links. Write a link with `class="slidelink"` and `data-target=` whatever ID you want, and that will be used to call up the right slide with the matching ID.
* Title - appears in the slide.
* Breadcrumb - the text that shows up in the breadcrumb section.
* AboveFold - text that is not collapsed.

The optional columns are:
* FoldHeaderN and FoldTextN - These are headers and text for collapsible sections within the slide. You can have up to 9 folds before the system breaks.
* IconN, IconTargetN, and IconAltN - These are the filename, link target, and alt text for your icons. You can have up to 9 icons before the system breaks.
