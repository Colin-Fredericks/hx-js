$(document).ready(function () {
  // Name the class that flags our flow containers.
  var flow_class = 'hx-textflow-';

  flow_sets = findThoseFlows(flow_class);
  flowThatText(flow_sets);

  /**
   * Finds all elements with the right classes.
   * @param {*} flow_class 
   * @returns object with classes as keys and array of flow elements as values
   */
  function findThoseFlows(flow_class) {
    var textflowElements = $('div[class*="' + flow_class + '"]');
    // Get all the sets of textflow elements.
    let flow_sets = {};
    textflowElements.each(function () {
      let e = $(this);
      let classes = e.attr('class').split(' ');
      for (let i = 0; i < classes.length; i++) {
        if (classes[i].startsWith(flow_class)) {
          // If the set of textflow elements doesn't exist, create it.
          if (!flow_sets[classes[i]]) {
            flow_sets[classes[i]] = [];
          }
          flow_sets[classes[i]] = e;
          continue;
        }
      }
    });
    return flow_sets;
  }

  /**
   * For each set of textflow elements, flow the text from first to last in DOM.
   * @param {*} flow_sets
   */
  function flowThatText(flow_sets) {
    for (let set in flow_sets) {
      // get the height of the first element in the set.
      let first_height = flow_sets[set][0].height();
      // How tall is a line of text?
      let line_height = flow_sets[set][0].css('line-height');
      // How many lines of text can we fit in the height of the first element?
      let lines_in_height = first_height / line_height;
      // How many lines of text do we actually have?
      let lines_in_set = null;

      // TODO: Continue writing from here.
      // How do we know how many lines of text we have?
      // When should we stop flowing?

    }
  }
});
