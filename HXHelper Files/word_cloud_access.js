$(document).ready(function () {
  // Only do stuff once the word clouds actually appear.
  let completed_time = 0;
  let empty_time = 0;
  let interval = 250;
  let loop_timeout = 3000; // miliseconds
  let current_counts = [];
  let timers = [];

  function completeCloudChecker() {
    console.debug('complete time ' + completed_time);
    if (
      $('.xblock-student_view-word_cloud  .word_cloud > svg > g > g').length > 0
    ) {
      parseClouds();
      clearInterval(waitForCompletedClouds);
    }
    if (completed_time > loop_timeout) {
      clearInterval(waitForCompletedClouds);
    }
    completed_time += interval;
  }

  function emptyCloudChecker() {
    console.debug('empty time ' + empty_time);
    if ($('.xblock-student_view-word_cloud button.save').length > 0) {
      completed_time = 0;
      empty_time = 0;
      $('.xblock-student_view-word_cloud button.save').on('click', function () {
        console.log('clicky click');
        completed_time = 0;
        waitForCompletedClouds = setInterval(completeCloudChecker, interval);
      });
      clearInterval(waitForEmptyClouds);
    }
    if (empty_time > loop_timeout) {
      clearInterval(waitForEmptyClouds);
    }
    empty_time += interval;
  }

  let waitForCompletedClouds = setInterval(completeCloudChecker, interval);
  let waitForEmptyClouds = setInterval(emptyCloudChecker, interval);

  function parseClouds() {
    console.debug('parseClouds');
    // Loop through all the word clouds.
    $('.xblock-student_view-word_cloud').each(function () {
      console.debug(this);
      let result_box = $(this).find('.total_num_words');
      let word_list = [];

      // Scraping the text and getting word/percent pairs
      // Might want to sort this eventually, but right now it's pre-sorted.
      $(this)
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
    });
  }
});
