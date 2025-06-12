/****************************
 * Course info extractor for LXP
 * Runs via bookmarklet
 * Written by Colin Fredericks at HarvardX
 * MIT licensed
 ****************************/

javascript:(function(){s=document.createElement('script');s.type='text/javascript';s.src='https://colin-fredericks.github.io/hx-js/public_html/course_staff_adder.js?v='+parseInt(Math.random()*99999999);document.body.appendChild(s);})();

(function() {
  let data = __NUXT__.data;
  let keys = Object.keys(__NUXT__.data);
  let learner_info = {
    name: {
      first: data[keys[6]].firstName,
      last: data[keys[6]].lastName
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
  console.log(learner_info);
  console.log('Course:');
  console.log(course_info);
  console.log('Location:');
  console.log(location);
  console.log('Course structure:');
  console.log(course_structure);

})();
