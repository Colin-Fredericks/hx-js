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

  // Some files cannot be deleted and need to be skipped.
  function canBeDeleted(filename) {
    let undeletable = [
      'python_lib.zip',
      '&',
      '%',
    ];

    for (let i = 0; i < undeletable.length; i++) {
      if (filename.includes(undeletable[i])) {
        return false;
      }
    }
    return true;
  }

  // Not all files can be deleted. Return the index of the first one that can.
  function getNextDeletableFile() {
    let all_filenames = $("button[data-identifier='asset-delete-button']")
      .parents('tr')
      .find('span[data-identifier="asset-file-name"]');
    
    // Filter to just the filenames that cannot be deleted.
    undeletable_filenames = all_filenames.filter(function (index) {
      return !canBeDeleted(all_filenames[index].textContent);
    });
    console.log(undeletable_filenames);
    
    return undeletable_filenames.length;
  }

  // Delete every file that we can actually delete.
  function destroyEverything() {
    // Try to delete a file every 2 seconds.

    let timer = setInterval(function () {
      let delete_buttons = $("button[data-identifier='asset-delete-button']");
      console.log(delete_buttons);
      // Not all files can be deleted. Skip ahead to one that can.
      let n = getNextDeletableFile();
      console.log(n);
      if (delete_buttons.length >= n) {
        delete_buttons[n].click();
        console.log('clicked delete button');
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

  // Check to make sure they really want to do this.
  function makeModal() {
    if ($('#modal-1').length > 0) {
      console.log('modal already exists');
      return;
    }

    let duration = Number($('.result-count-wrapper span')[7].innerText) * 2;
    if(duration > 60) {
      duration = Math.round(duration / 60) + ' minutes';
    } else {
      duration = duration + ' seconds';
    }

    let d = $('<div>');
    d.attr('id', 'modal-1');

    let content = $('<main>');
    content.attr('id', 'modal-1-content');

    let explanation = $('<p>');
    explanation.text(
      'Are you really sure you want to delete EVERYTHING in Files and Uploads?'
    );

    let details = $('<p style="font-size: small;"></p>');
    details.text(
      'Maybe you want to take a backup of the course first so you can save the SRT files? ' +
        'Maybe you want to search for a specific file type first and run this again to just delete those? ' +
        'There\'s no "undo" button here, FYI, and the dialog is going to flash a lot ' +
        'for the next ' +
        duration
    );

    content.append(explanation);
    content.append(details);

    d.append(content);
    $('body').append(d);
    console.log('modal made');
  }
});
