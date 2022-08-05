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
    $('#modal-1').parent().css("background", "white");
    $('#modal-1').parent().css("border", "2px solid black");
    console.log('dialog displayed');
  }

  function destroyEverything() {
    // Try to delete a file every .5 seconds.

    let timer = setInterval(function () {
      let delete_buttons = $("button[data-identifier='asset-delete-button']");
      if (delete_buttons.length > 0) {
        delete_buttons[0].click();
        // look for a visible confirmation dialog every .2 seconds
        let inner_timer = setInterval(function () {
          let confirm_button = $(
            "button[data-identifier='asset-confirm-delete-button']:visible"
          );
          if (confirm_button.length > 0) {
            clearInterval(inner_timer);
            confirm_button[0].click();
          }
        }, 500);
      } else {
        clearInterval(timer);
        $('#modal-1').dialog('destroy');
      }
    }, 500);
  }

  function makeModal() {
    if ($('#modal-1').length > 0) {
      console.log('modal already exists');
      return;
    }

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
        'There\'s no "undo" button here, FYI, and the dialog is going to flash a lot.'
    );

    content.append(explanation);
    content.append(details);

    d.append(content);
    $('body').append(d);
    console.log('modal made');
  }
});
