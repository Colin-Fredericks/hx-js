var hxWordCloudHandler = (function(){

  console.debug("working");

  // A list of DOM elements. Keeping track of all the word clouds.
  let word_cloud_list = [];
  let word_cloud_observers = [];

  // Set mutation observer on the <main> tag.
  const main_tag = document.querySelector('main');
  const config = { childList: true, subtree: true };
  const main_observer = new MutationObserver(mainCallback);
  main_observer.observe(main_tag, config);
  // Close it out after 10 seconds
  let stopObserving = setTimeout(function(){
    main_observer.disconnect();
    console.log("Done observing");
  }, 10000);

  function mainCallback(mutationsList, main_observer) {
    // Use traditional 'for loops' for IE 11
    for(const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // console.debug('A child node has been added or removed.');
        // console.debug(mutation.target);
        // Check this element against the list of word clouds.
        let class_list = Array.from(mutation.target.classList);
        if(class_list.includes('word_cloud')){
          // The container for word clouds has an id that starts with "word_cloud"
          if(mutation.target.id.includes('word_cloud')){
            // If it's a new element, add it and start a word cloud observer on it.
            if(!word_cloud_list.includes(mutation.target)){
              word_cloud_list.push(mutation.target);
              console.debug("new word cloud: ");
              console.debug(mutation.target);
              let n = word_cloud_list.length - 1;
              word_cloud_observers[n] =  new MutationObserver(wordCallback);
              word_cloud_observers[n].observe(main_tag, config);
            }
          }
        }
      }
    }
  }

  // In each word cloud, look for two possible mutations (additions):
  // 'button.save' indicates an incomplete cloud.
    // Keep those observers running.
    // When button.save disappears, start an observer for the cloud again.
    // Look for a completed cloud. (Close out after 5 sec again.)

  // '.word_cloud > svg > g > g' indicates a completed cloud.
    // run parseCloud on it.
    // Close out those observers after 5 seconds.

  // For a completed cloud:
  function parseCloud(cloud) {
    console.debug('parseCloud');
    console.debug(cloud);
    let result_box = $(cloud).find('.total_num_words');
    let word_list = [];

    // Scraping the text and getting word/percent pairs
    // Might want to sort this eventually, but right now it's pre-sorted.
    $(cloud)
      .find('.word_cloud > svg > g > g')
      .each(function () {
        word_list.push({
          word: $(this).find('text').text(),
          percent: Number($(this).find('title').text().slice(0, -1)),
        });
      });

    word_list.sort((a, b) => b.percent - a.percent);

    console.debug(word_list);

    // Don't run on empty word clouds.
    if (word_list.length === 0) {
      return false;
    }

    // Put a summary into the box.
    result_box.empty();
    result_box.append('<h4>Top Words</h4>');

    let num_top_items = 5;
    let top_list = $('<ul class="top_words"></ul>');
    for (let i = 0; i < num_top_items; i++) {
      top_list.append(
        '<li>' + word_list[i].word + ': ' + word_list[i].percent + '%</li>'
      );
    }
    result_box.append(top_list);

    // Add a collapsible bit with the rest of the info.
    let details_tag = $('<details></details>');
    let summary_tag = $('<summary>Show full word list</summary>');
    let rest_of_list = $('<ul></ul>');
    for (let i = num_top_items; i < word_list.length; i++) {
      rest_of_list.append(
        '<li>' + word_list[i].word + ': ' + word_list[i].percent + '%</li>'
      );
    }
    details_tag.append(summary_tag);
    details_tag.append(rest_of_list);
    result_box.append(details_tag);
  }

})();
