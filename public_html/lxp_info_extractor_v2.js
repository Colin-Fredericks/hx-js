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

  function makeModal(title, content){
    let modal = document.createElement('div');
    modal.className = 'vpal-modal';
    modal.innerHTML = `
      <div class="vpal-modal-content" style="display:none;">
        <span class="vpal-close">&times;</span>
        <h2>${title}</h2>
        <p>${content}</p>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Close the modal when the user clicks on <span> (x)
    modal.querySelector('.lxp-close').onclick = function() {
      modal.remove();
    };
    
    // Close the modal when the user clicks anywhere outside of it
    window.onclick = function(event) {
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
    // I had thought that those were in the item below, but apparently not.
    // name: data[keys[4]].meta.name,
    // page_id: data[keys[4]].id,
    open_date: ifDef(data[keys[4]].gating.openAt, 'No open date'),
    due_date: ifDef(data[keys[4]].gating.dueAt, 'No due date'),
    parent_id: data[keys[1]].children.filter(
      (x) => x.id == window.location.href.split('/').slice(-1)[0]
    )[0].parentId,
    authoring_link:
      'https://author.harvardonline.harvard.edu/repository/' +
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

  makeModal("LXP Course Info Extractor", "<p>Testing</p>");
  document.querySelector('.vpal-modal-content').style.display = 'block';
  document.querySelector('.vpal-modal-content').style.position = 'absolute';
})();
