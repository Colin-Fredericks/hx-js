// Creates a downloadable HTML file for learners
// from input they've made in the course.

// This is just test data.
// TODO: pull input data from the Learner Backpack.
student_data = {
  title: 'Hello World',
  layout: 'text_1 image_1 / text_1 table_1 / text_2 text_2',
};

// Here's what a fully-filled-out student_data object looks like.
// Component types: text, image, bullets, table, blank.
/*

student_data = {
    "title": "Hello World",
    "layout": "text_1 image_1 / text_1 table_1 / text_2 text_2",
    "components": {
        "text_#": A markdown-formatted text string,
        "image_#": {
            "source": a URL or data URI,
            "alt": a string of the alt text for the image
        },
        "table_#": a DOM object of a table,
        "list_#": {
            "type": "bullets" or "numbered",
            "items": an array of list items
        }
    }
};
*/

// Creates a downloadable HTML file and starts the download.
function makeDownloadableOutput() {
    let page = makePage();
    let blob = new Blob([page], { type: 'text/html' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement('a');
    link.href = url;
    link.download = 'output.html';
    link.click();
  }
  
// Creates the HTML page.
function makePage() {
  let page =
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>` +
    title +
    `</title>` +
    makeStyles() +
    makeScripts() +
    `</head>
<body>
    <h1>Hello World</h1>
    <p>This is a paragraph.</p>` +
    makeGrid(student_data) +
    `</body>
</html>`;
  return page;
}

function makeScripts() {}

function makeStyles() {}

// Makes the grid template for the output.
// Layout format: "text_1 image_1 / text_1 table_1 / text_2 text_2"
// TODO: Should this be done in objects instead of text?
function makeGrid(student_data) {
  let grid_cells = student_data.layout.split(' ').filter((x) => x != '/');
  let grid = "<div class='grid-layout'>";
  for (let i = 0; i < grid_cells.length; i++) {
    grid += "<div class='grid-item' grid-area: " + grid_cells[i] + '>';
    grid += makeGridComponents(grid_cells[i], student_data.components[grid_cells[i]]);
    grid += '</div>';
  }
  grid += '</div>';
  return grid;
}

// Returns the HTML for the grid components.
// Mostly shuffles things to other functions.
function makeGridComponents(cell_type, content) {
  if (cell_type.includes('text')) {
    return makeText(content);
  } else if (cell_type.includes('image')) {
    return makeImage(content);
  } else if (cell_type.includes('table')) {
    return makeTable(content);
  } else if (cell_type.includes('list')) {
    return makeList(content);
  } else {
    return cell_type + ' debug';
  }
}

// Content is markdown. Need a parser.
// options: 
//   https://github.com/showdownjs/showdown/blob/master/dist/showdown.min.js (100kB)
//   https://github.com/markedjs/marked/blob/master/marked.min.js (50kB)
// Also HTML sanitizer: https://github.com/cure53/DOMPurify/blob/main/dist/purify.min.js (20kB)
function makeText(content) {
  return sanitizeHTML(parseMarkdown(content));
}

// Content should be a URL or data URI.
function makeImage(content) {
  return '<img src="' + content.source + ' alt="' + content.alt + '">';
}


/*

<html><head>
  <style>
    div div {height: 100px;}
  </style>
</head><body>
<div style="display:grid; grid: auto auto auto / 120px 120px; grid-template-areas: 'top top' 'ml mr' 'bot bot'">
  <div style="border: 2px solid black; margin: 4px; grid-area: top"></div>
  <div style="border: 2px solid black; margin: 4px; grid-area: ml"></div>
  <div style="border: 2px solid black; margin: 4px; grid-area: mr"></div>
  <div style="border: 2px solid black; margin: 4px; grid-area: bot;"></div>
</div>
</body></html>

*/
