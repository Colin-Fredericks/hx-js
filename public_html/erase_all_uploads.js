/****************************
 * Course Content Eraser for edX
 * Runs via bookmarklet.
 * Written by Colin Fredericks at HarvardX
 * MIT licensed
 ****************************/

$(document).ready(function () {
  console.log('erase_all_uploads called');

  showWarningDialog();

  function showWarningDialog() {
    // Do they really want to delete every single thing in Files & Uploads?

    makeModal();
    $('#modal-1').dialog({
      title: 'Double-Checking Your Intent',
      modal: true,
      width: '50%',
      buttons: [
        {
          text: 'I changed my mind.',
          click: function () {
            $('#modal-1').dialog('destroy');
          },
        },
        {
          text: 'DESTROY.',
          click: function () {
            destroyEverything();
            console.log('erasing everything');
          },
        },
      ],
      open: function (event, ui) {
        $('.ui-dialog-titlebar-close').hide();
        $('.ui-dialog').focus();
        $('.ui-widget-overlay').on('click', function () {
          $('#modal-1').dialog('close');
        });
      },
    });
    $('#modal-1').parent().css('background', 'white');
    $('#modal-1').parent().css('border', '2px solid black');
    console.log('dialog displayed');
  }

  function getNextFileWithout(text, n = 0) {
    let filename = '';
    let all_filenames = $("button[data-identifier='asset-delete-button']")
      .parents('tr')
      .find('span[data-identifier="asset-file-name"]');
    if (all_filenames.length > 0) {
      filename = all_filenames[n].textContent;
    } else {
      return n;
    }
    console.log(filename);
    console.log(n);
    if (filename.includes(text)) {
      return getNextFileWithout(text, n + 1);
    }
    return n;
  }

  function destroyEverything() {
    // Try to delete a file every 2 seconds.

    let timer = setInterval(function () {
      let delete_buttons = $("button[data-identifier='asset-delete-button']");
      console.log(delete_buttons);
      // Make sure this file doesn't have python_lib.zip in its name.
      let n = getNextFileWithout('python_lib.zip');
      console.log(n);
      if (delete_buttons.length >= n) {
        delete_buttons[n].click();
        console.log('deleted a file');
        // look for a visible confirmation dialog every 500 ms.
        let inner_timer = setInterval(function () {
          let confirm_button = $(
            "button[data-identifier='asset-confirm-delete-button']:visible"
          );
          if (confirm_button.length > 0) {
            console.log(confirm_button);
            clearInterval(inner_timer);
            confirm_button[0].click();
            console.log('confirmed deletion');
          }
        }, 500);
      } else {
        clearInterval(timer);
        $('#modal-1').dialog('destroy');
      }
    }, 2000);
  }

  function makeModal() {
    if ($('#modal-1').length > 0) {
      console.log('modal already exists');
      return;
    }

    let duration = Number($('.result-count-wrapper span')[7].innerText) * 2;

    let d = $('<div>');
    d.attr('id', 'modal-1');

    let content = $('<main>');
    content.attr('id', 'modal-1-content');

    let explanation = $('<p>');
    explanation.text(
      'Are you really sure you want to delete EVERYTHING in Files and Uploads?'
    );

    let user_type = $('#member-lists-selector option:selected').text();
    let details = $('<p style="font-size: small;"></p>');
    details.text(
      'Maybe you want to take a backup of the course first so you can save the SRT files? ' +
        'Maybe you want to search for a specific file type first and run this again to just delete those? ' +
        'There\'s no "undo" button here, FYI, and the dialog is going to flash a lot ' +
        'for the next ' +
        duration +
        ' seconds.'
    );

    content.append(explanation);
    content.append(details);

    d.append(content);
    $('body').append(d);
    console.log('modal made');
  }
});
