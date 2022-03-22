What simple processes can we automate for the backpack?
Common ways to store and retrieve information from the backpack:
* Store data from form field
* Put data into form field
* Put data into HTML component
* Build custom components from data (e.g. svg, list)

use data attributes:
  data-backpack-store="varname" - flags text in this for storage
  data-backpack-save-button="varname" - save the "store" data for this variable when this is clicked.
  data-backpack-save-all-button="anything" - save *all* the "store" data when this is clicked.
  data-backpack-get="varname" - auto-fills textarea, text input box, or text element
  data-backpack-clear="varname" - for when they click on a "clear" button.

Will need a different set for non-text if we want to auto-fill radio buttons and such this easily.

data-backpack-store-form-varname="true" - flags this entire form for storage. Serialize the output.
data-backpack-get-form-varname="true"
