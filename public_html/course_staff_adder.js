/****************************
 * Course staff adder for edX
 * Runs via bookmarklet.
 * Written by Colin Fredericks at HarvardX
 * MIT licensed
 ****************************/

$(document).ready(function () {
  console.log('course_staff_adder called');

  showInputDialog();

  function showInputDialog() {
    // Open dialog with text area and GO button.
    // Let user paste in a list of usernames or e-mail addresses
    // Get those as an array.

    makeModal();
    $('#modal-1').dialog({
      title: 'User List Input',
      modal: true,
      width: '50%',
      buttons: [
        {
          text: 'Cancel',
          click: function () {
            $('#modal-1').dialog('destroy');
          },
        },
        {
          text: 'Go',
          click: function () {
            addUsers();
            console.log('adding users');
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
    console.log('testing');
  }

  function addUsers() {
    // Get the list of users to add.
    let new_users = $('#new_user_list').val();
    // Separate on newlines and commas.
    let user_list = new_users.split(/[,\n]/g);
    // Strip whitespace
    user_list.forEach(function (e, i) {
      user_list[i] = e.trim();
    });
    console.log(user_list);

    // Try to add a user every .2 seconds.
    let i = 0;
    let timer = 0;
    let max_time = 2; //seconds
    let added_users = [];
    let lost_users = [];
    // Get the username entry box and the submit button
    let entry_box = $('.bottom-bar input.add-field:visible');
    let add_button = $('.bottom-bar input.add:visible');

    let ticker = setInterval(function () {
      let user = user_list[i];

      // If we haven't tried to add this user yet, go for it.
      if (added_users[i] === undefined) {
        entry_box.val(user);
        add_button.click();
      }

      // Move on once the username is added or the max time is past.
      if ($('td:contains("' + user + '")').length > 0) {
        added_users[i] = user;
        i++;
      } else if (timer > max_time) {
        lost_users.push(user);
        console.log("couldn't add " + user);
        timer = 0;
        i++;
      }

      // When we're done, let us know if we missed anyone.
      if (i >= user_list.length) {
        clearInterval(ticker);
        console.log(added_users);
        if (lost_users.length > 0) {
          // TODO: Not reporting correctly, not sure why.
          // alert('Could not add these users: ' + lost_users.join(', '));
          console.log(lost_users);
        }
      }
      timer += 0.2;
    }, 200);
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
      'Paste e-mail addresses or usernames below, then hit the "Go" button.'
    );

    let user_type = $('#member-lists-selector option:selected').text();
    let details = $('<p style="font-size: small;"></p>');
    details.text(
      'Separate with commas or newlines. Users will be added as ' +
        user_type +
        '. To switch between staff/admin/other, go back and change the dropdown on this page.'
    );

    let listbox = $('<textarea rows="5" style="width: 100%;"></textarea>');
    listbox.attr('id', 'new_user_list');

    content.append(explanation);
    content.append(details);
    content.append(listbox);

    d.append(content);
    $('body').append(d);
    console.log('modal made');
  }
});
