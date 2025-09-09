/****************************
 * Course info extractor for LXP
 * Runs via bookmarklet
 * Written by Colin Fredericks at HarvardX
 * MIT licensed
 ****************************/

(function () {
  // Make key pretty for printing to console or as text
  function makeKeyPretty(key) {
    let key_pretty = key.charAt(0).toUpperCase() + key.slice(1);
    return key_pretty.replace(/_/g, ' ');
  }
  // Get value or default if undefined
  function ifDef(v, def = null) {
    if (typeof v !== 'undefined') return v;
    else return def;
  }

  function makeModal(title, content) {
    let modal = document.createElement('div');
    modal.className = 'vpal-modal';
    modal.innerHTML = `
      <div class="vpal-modal-content" style="display: none; position: fixed; z-index: 100000; left: 50%; top: 50%; transform: translate(-50%, -50%); background-color: white; padding: 20px; border: 3px solid grey; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
        <span class="vpal-modal-close"
            style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;"
        >&times;</span>
        <h2>${title}</h2>
        <div>${content}</div>
        <p style='font-size: small;'>Press Escape to close</p>
      </div>
    `;
    document.body.appendChild(modal);
    // If the escape key is pressed, close the modal
    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        modal.remove();
      }
    });

    // Close the modal when the user clicks on <span> (x)
    modal.querySelector('.vpal-modal-close').onclick = function () {
      modal.remove();
    };

    // Close the modal when the user clicks anywhere outside of it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.remove();
      }
    };
  }

  let data = __NUXT__.data;
  let keys = Object.keys(__NUXT__.data);
  let learner_info = {
    name: {
      first: data[keys[6]].firstName,
      last: data[keys[6]].lastName,
    },
    anonymous_id: data[keys[6]].id,
    email: data[keys[0]].email,
    role: data[keys[0]].role,
  };
  let course_info = {
    tenant: data[keys[0]].tenant.name,
    name: data[keys[1]].data.name,
    wave: data[keys[3]].id,
    swift_course_id: data[keys[1]].id,
  };
  let location = {
    name: document.querySelector('a.active-page').text,
    page_id: window.location.href.split('/').slice(-1)[0],
    parent_id: data[keys[1]].children.filter(
      (x) => x.id == window.location.href.split('/').slice(-1)[0]
    )[0].parentId,
    open_date: ifDef(data[keys[4]].gating.openAt, 'No open date'),
    due_date: ifDef(data[keys[4]].gating.dueAt, 'No due date'),
    authoring_link:
      'https://' +
      window.location.host.replace('learn', 'author') +
      '/repository/' +
      data[keys[1]].id +
      '/editor/' +
      window.location.href.split('/').slice(-1)[0],
  };
  let course_structure = data[keys[1]].children;

  console.log('Learner:');
  for (let key in learner_info) {
    console.log(
      `  ${makeKeyPretty(key)}: ${JSON.stringify(learner_info[key])}`
    );
  }

  console.log('Course:');
  for (let key in course_info) {
    console.log(`  ${makeKeyPretty(key)}: ${JSON.stringify(course_info[key])}`);
  }

  console.log('Location:');
  for (let key in location) {
    console.log(`  ${makeKeyPretty(key)}: ${JSON.stringify(location[key])}`);
  }

  console.log('Course structure:');
  // Need to rearrange this in order to pretty-print it.
  // Right now it's a flat list of objects with IDs and parents; we'll need a tree.
  console.log(course_structure);

  let html_content = `
    <h3 style="margin-top: 0.5em;">Learner Info</h3>
    <ul>
      <li style="margin-left: 2em;"><strong>First Name:</strong> ${learner_info.name.first}</li>
      <li style="margin-left: 2em;"><strong>Last Name:</strong> ${learner_info.name.last}</li>
      <li style="margin-left: 2em;"><strong>Anonymous ID:</strong> ${learner_info.anonymous_id}</li>
      <li style="margin-left: 2em;"><strong>Email:</strong> ${learner_info.email}</li>
      <li style="margin-left: 2em;"><strong>Role:</strong> ${learner_info.role}</li>
    </ul>
    <h3 style="margin-top: 0.5em;">Course Info</h3>
    <ul>
      <li style="margin-left: 2em;"><strong>Tenant:</strong> ${course_info.tenant}</li>
      <li style="margin-left: 2em;"><strong>Course Name:</strong> ${course_info.name}</li>
      <li style="margin-left: 2em;"><strong>Wave ID:</strong> ${course_info.wave}</li>
      <li style="margin-left: 2em;"><strong>Swift Course ID:</strong> ${course_info.swift_course_id}</li>
    </ul>
    <h3 style="margin-top: 0.5em;">Location Info</h3>
    <ul>
      <li style="margin-left: 2em;"><strong>Page Name:</strong> ${location.name}</li>
      <li style="margin-left: 2em;"><strong>Page ID:</strong> ${location.page_id}</li>
      <li style="margin-left: 2em;"><strong>Parent ID:</strong> ${location.parent_id}</li>
      <li style="margin-left: 2em;"><strong>Open Date:</strong> ${location.open_date}</li>
      <li style="margin-left: 2em;"><strong>Due Date:</strong> ${location.due_date}</li>
      <li style="margin-left: 2em;"><strong>Authoring Link:</strong> <a href="${location.authoring_link}" target="_blank">${location.authoring_link}</a></li>
    </ul>
  `;

  makeModal('LXP Course Info Extractor', html_content);
  document.querySelector('.vpal-modal-content').style.display = 'block';
  document.querySelector('.vpal-modal-content').style.position = 'absolute';
})();
