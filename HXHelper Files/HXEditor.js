// This version is designed to be called by hx.js
// It uses the Summernote editor.

var HXEditor = function() {
  // Insert a loading indicator.

  // Wait for summernote to load.
  // It's in an external javascript file.

  // If it doesn't load after X seconds,
  // kill the indicator and inform the learner.

  // If it does load...
  // Activate summernote.

  // Add save/load buttons

  // Indicate success for saving.

  // Set up auto-save loop

  // If we try to save while auto-saving, don't bother.
  // just show the success indicator.

  $('#startsummernote').on('click tap', function() {
    $('#summernote').empty();
    console.log('starting summernote editor');
    $('#summernote').summernote({
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link']],
        ['view', ['fullscreen', 'codeview', 'help']]
      ]
    });
  });
  $('#savenote').on('click tap', function() {
    let markupStr = $('#summernote').summernote('code');
    hxSetData('summernote', markupStr);
    console.log(markupStr);
  });
  $('#loadhtml').on('click tap', function() {
    $('#summernote').summernote('code', hxGetData('summernote'));
  });
};
