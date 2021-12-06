$(document).ready(function() {

  // Dig through all the word clouds and scrape them so we can show some summary info.
  function parseClouds(cloud) {
    console.debug('parseClouds');

    let result_box = cloud.find('.total_num_words');
    let word_list = [];

    // Scraping the text and getting word/percent pairs
    // Storing percent as an actual number so we can sort on it.
    cloud
      .find('.word_cloud > svg > g > g')
      .each(function() {
        word_list.push({
          word: cloud.find('text').text(),
          percent: Number(cloud.find('title').text().slice(0, -1)),
        });
      });

    // Just in case it's not given to us pre-sorted.
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

  function completeCloudChecker(cloud) {
    console.debug('timer for complete word clouds ' + completed_time);
    // This is an actual word within the cloud.
    // If we can select that, it's present to be scraped.

    // TODO: Right now this waits for *one* cloud to be completed and assumes
    // that the rest are there. That's no good. We should probably run
    // separate processes on each one.
    if (cloud.find('.word_cloud > svg > g > g').length > 0) {
      parseClouds();
      clearInterval(waitForCompletedClouds);
    }
    if (completed_time > loop_timeout) {
      clearInterval(waitForCompletedClouds);
    }
    completed_time += interval;
  }

  function emptyCloudChecker(cloud) {
    console.debug('timer for empty word clouds ' + empty_time);
    if (cloud.find('button.save').length > 0) {
      completed_time = 0;
      empty_time = 0;
      // TODO: Right now this waits for *one* save button to be visible assumes
      // that the rest are there. That's no good. We should probably run
      // separate processes on each cloud.
      $('.xblock-student_view-word_cloud button.save').on('click', function() {
        console.debug('word cloud submitted');
        completed_time = 0;
        // The rendered cloud might not appear immediately - we need to wait.
        waitForCompletedClouds = setInterval(completeCloudChecker, interval);
      });
      clearInterval(waitForEmptyClouds);
    }
    if (empty_time > loop_timeout) {
      clearInterval(waitForEmptyClouds);
    }
    empty_time += interval;
  }

  // Loop through all the word clouds.
  $('.xblock-student_view-word_cloud').each(function() {
    console.debug(this);

    // Only do stuff once the word clouds actually appear.
    let completed_time = 0;
    let empty_time = 0;
    let interval = 250;
    let loop_timeout = 3000; // miliseconds

    // Wait until the word cloud is actually displayed before we try to scrape it.
    let waitForCompletedClouds = setInterval(completeCloudChecker, interval, $(this));
    // If the word cloud hasn't been submitted yet, we need to wait for the
    // "save" button to show up before we can add a listener to it.
    let waitForEmptyClouds = setInterval(emptyCloudChecker, interval, $(this));
  });

});
