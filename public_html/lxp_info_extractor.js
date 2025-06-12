/****************************
 * Course info extractor for LXP
 * Runs via bookmarklet
 * Written by Colin Fredericks at HarvardX
 * MIT licensed
 ****************************/

(function () {
  function makeKeyPretty(key) {
    let key_pretty = key.charAt(0).toUpperCase() + key.slice(1);
    return key_pretty.replace(/_/g, ' ');
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
    name: data[keys[4]].meta.name,
    open_date: data[keys[4]].gating.openAt,
    due_date: data[keys[4]].gating.dueAt,
    page_id: data[keys[4]].id,
    parent_id: data[keys[4]].parentId,
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
  for (let key in course_structure) {
    let spacing = '  ';
    if (key.includes('PAGE')) {
      spacing = '    ';
    }
    console.log(
      `${spacing}${makeKeyPretty(key)}: ${JSON.stringify(
        course_structure[key]
      )}`
    );
  }
})();
