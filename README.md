<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of Contents** _generated with [DocToc](https://github.com/thlorenz/doctoc)_

- [HX-JS: HarvardX Standard Javascript and CSS](#hx-js-harvardx-standard-javascript-and-css)
  - [Currently Working On...](#currently-working-on)
    - [Future Improvements](#future-improvements)
  - [How to Implement HXJS in your course](#how-to-implement-hxjs-in-your-course)
    - [Simple Appearance Changes](#simple-appearance-changes)
    - [Pretty boxes](#pretty-boxes)
    - [Sidebar Tables](#sidebar-tables)
    - [Visibility Toggle](#visibility-toggle)
    - [Highlighter Toggle](#highlighter-toggle)
    - [Code Syntax Highlighting](#code-syntax-highlighting)
    - [Pop-ups for clickable images](#pop-ups-for-clickable-images)
    - [Automated Footnotes](#automated-footnotes)
    - [Image Slider](#image-slider)
    - [Text Sliders](#text-slider)
    - [Video Links](#video-links)
    - [Easter Egg](#easter-egg)
    - [Jump To Time](#jump-to-time)
    - [Pop-up Assessments](#pop-up-assessments)
    - [Automated Table of Contents for Long Pages](#automated-table-of-contents-for-long-pages)
    - [Forum Tricks](#forum-tricks)
    - [Backpack](#learner-backpack)
    - [Editor](#rich-text-editor)
  - [Future Features](#future-features)
    - [Intro.js walkthroughs](#introjs-walkthroughs)
    - [Audio Player](#audio-player)
  - [Full List of Preferences and Settings](#full-list-of-preferences-and-settings)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# HX-JS: HarvardX Standard Javascript and CSS

This project collects a large number of javascript and css tricks that have been used in various HX courses and puts them all in one place so that they're easier to implement.

## Currently Working On...

Improvements to the [Editor](#rich-text-editor). Specifically:

- Ability to save in multiple slots ✅
- Renaming and deleting "files" ✅
- Download HTML version ✅
- Prefilled text ✅
- Automatic new slot from old file (for 2nd drafts) ✅
- Adjustable default height for editor ✅
- Notification when you're running out of space ✅ (sort of)
- Accessibility audit
- Handle empty menus

### Future Improvements

- Various functionality additions.
- Getting this to work globally throughout a course without needing to load it on each page.

## How to Implement HXJS in your course

First, download [HXHelper Files.zip](https://github.com/Colin-Fredericks/hx-js/raw/master/HXHelper%20Files.zip) unzip it, and upload all of the things therein to your Files & Uploads section. This will let you use...

- [Video Links](https://github.com/Colin-Fredericks/edx-video-augments),
- [Pop-Up Problems](https://github.com/Colin-Fredericks/edx-embedded-video-problems),
- [Slick](https://kenwheeler.github.io/slick/)-style image sliders,
- [intro.js](https://github.com/usablica/intro.js) text-based walkthroughs with some accessibility improvements,

Also upload the three files from this repo:

- **hx.js**, which puts all the javascript in one place
- **hx.css**, which is all the css in one file
- **hxGlobalOptions.js**, which sets the global options for hx.js

Once you've done that, copy the lines below into a Raw HTML element:

```html
<script src="/static/hx.js" type="text/javascript"></script>
<link rel="stylesheet" type="text/css" href="/static/hx.css" />
```

Or, if you're using the minified versions from [hx-min.zip](https://github.com/Colin-Fredericks/hx-js/raw/master/hx-min.zip):

```html
<script src="/static/hx-min.js" type="text/javascript"></script>
<link rel="stylesheet" type="text/css" href="/static/hx-min.css" />
```

That will enable hx.js for all components on that page. It should be doing exactly nothing so far. You can test whether it's working by entering the Konami Code.

To make other things happen, you'll need to add specific classes to your HTML, and in some cases make little changes to your hxGlobalOptions.js file. Here's the full list of awesome stuff:

### Simple Appearance Changes

All of these are classes that you add to various elements.

- For **drop caps** that are text rather than an image, do `<span class="hx-dropcap">A</span>` on the first letter.
- For **small-caps headers**, do `class="hx-smallcaps"`. Works with h3 or h4.
- For a **superbold** white header with a solid color background, do `class="hx-superbold"`. You can do small caps with this.
- For an **underlined** header, do `class="hx-underline"`. You can do small caps with this.
- For images or divs that hang down on the **right-hand side**, use `class="hx-hangright"`.
- For images or divs that hang down on the **left-hand side**, including image-based drop-caps, use `class="hx-hangleft"`.
- To get rid of the top navigation "ribbon" and bottom left/right buttons, add `hxLocalOptions.collapsedNav = true;` to a script tag on your page. Warning: By doing this you are intentionally removing students' ability to get to other units in this subsection. Only do this in subsections that have just a single unit.
- To add a UTC clock on the right-hand side of the "pages" section, add `hxLocalOptions.showClock = true;` to a script tag on your page.
- Image maps are automatically rescaled to fit images if edX's responsive design changes the size of the image. To turn this off, set `hxLocalOptions.resizeMaps = false` in a script tag on your page.

### Pretty boxes

Blue boxes:

```html
<div class="hx-bluebox">
  <h4>Box Header</h4>
  <p>Other things in box</p>
</div>
```

Red boxes:

```html
<div class="hx-redbox">
  <h4>Box Header</h4>
  <p>Other things in box</p>
</div>
```

Grey (or gray) boxes:

```html
<div class="hx-greybox">
  <h4>Box Header</h4>
  <p>Other things in box</p>
</div>
```

Also available: orangebox, greenbox, magentabox, purplebox, bluebox2.

Sidebars (must combine with box style):

```html
<div class="hx-sidebar">
  <h4>Box Header</h4>
  <p>Other things in box</p>
</div>
```

Quotation/excerpt boxes (should combine with greybox):

```html
<div class="hx-excerpt">
  <h4 class="hx-smallcaps">Quotation Header</h4>
  <p>Actual honest-to-god quotation</p>
  <p class="hx-quote-source">Abraham Lincoln</p>
</div>
```

### Sidebar Tables

Just give your table tag `class="hx-hangleft"` or `class="hx-hangright"` and it'll be ready to go. Note that you shouldn't do more than two columns, or three if your headers and data are very compact.

If you need a really compact table, add `hx-compact-table` to the class.

### Automatic external link marker

In hxGlobalOptions, set `markExternalLinks: true,` in order to add FontAwesome external link markers to all links outside of edX. Note that links to other courses within edX will NOT currently get the markers.

### Visibility Toggle

This part makes the button:

```html
<p><button class="hx-togglebutton1">Toggle the sidebar on or off</button></p>
```

Then you match the number on -togglebutton# to your toggle target:

```html
<div class="hx-toggletarget1 hx-sidebar">
  <p>I am all the stuff you want to toggle on and off.</p>
</div>
```

Button 1 toggles target 1, button 2 toggles target 2, etc. If you toggle something that's offscreen (and if there's only a single target) then the target will scroll quickly into view.

If you want to have multiple buttons where clicking one disables the others, use a toggleset in their container:

```html
<p class="hx-toggleset">
  <button class="hx-togglebutton1">These buttons</button>
  <button class="hx-togglebutton2">Are exclusive</button>
  <button class="hx-togglebutton3">Of one another</button>
</p>
```

If you want the buttons to remember (via HTML5 local storage) whether they're hidden or shown, add the `hx-toggleremember` class.

```html
<p>
  <button class="hx-togglebutton1 hx-toggleremember">
    Toggle the sidebar on or off and keep it that way
  </button>
</p>
```

If you want to clear the memory, use the `hx-clearmemory` class. Without a number it clears everything; with a number it just clears that particular entry in the memory.

```html
<p>
  <button class="hx-clearmemory7">Forget my selection for toggle 7.</button>
</p>
```

### Highlighter Toggle

This part makes the button:

```html
<p><button class="hx-highlighter1">Highlight Important Things</button></p>
```

Match the number on -highlighter# with the class in the following code:

```html
<span class="hx-highlight1">Thing To Highlight</span>
```

Each button highlights all the things with matching numbers. You don't need a different number for each highlight; you need a different number for each _set_ of highlights.

### Code Syntax Highlighting

If you have a `<code>` element on the page, hx-js will find it and load [Prism](http://prismjs.com/) for syntax highlighting, using the Coy theme. The currently included languages are:

- Python
- MATLAB
- r
- LaTeX
- HTML/XML
- JavaScript
- CSS

To have these show up, put your code blocks in the following format:

```
<pre><code class="lang-xxxx"> Code Goes Here
More Lines of Code
End of Code
</code></pre>
```

...and replace lang-xxxx with lang-matlab, lang-r, lang-latex, or whatever you need for your course.

More can be added, but each one increases the download size, so be judicious about adding them.

### Pop-ups for clickable images

You will need an image map already prepared. I recommend https://www.image-maps.com/ to create one quickly.

Here's an example:

```html
<p class="hx-centered">
  <img
    src="https://placebear.com/500/300"
    alt="placeholder bear"
    usemap="#TheBearMap"
  />
</p>

<map id="BearMap1" name="TheBearMap">
  <area
    id="Area1"
    class="Bear1 hx-popup-opener"
    title="Bear 1"
    shape="rect"
    coords="150,0,320,120"
    alt="Bear number one"
  />
  <area
    id="Area2"
    class="Bear2 hx-popup-opener"
    title="Bear 2"
    shape="rect"
    coords="90,120,350,300"
    alt="Bear number two"
  />
</map>
```

Note the classes, Bear1 and Bear2. You can name them anything you want, but _they need to be the first class._ The `hx-popup-opener` class is also necessary, but don't put it first. The javscript will then look for divs with matching classes. _They need to be divs._ Here's an example:

```html
<div class="Bear1 hx-popup-content">
  <p>I am bear #1!</p>
</div>
<div class="Bear2 hx-popup-content">
  <p>I am bear #2!</p>
</div>
```

You can put them anywhere; they'll hide until you need them. When you click on the areas, the divs pop up.

Underneath, the javascript will automatically create a list with all of the targets, based on their "title" attribute. This list will also pop up the dialogs. If you would like to NOT have this (because you're going to write that list by hand), then you should include the following attribute on the map: `data-make-accessible-list="false"`.

### Automated Footnotes

First, make a Raw HTML component at the bottom of your page with this in it:

```html
<h3>Footnotes</h3>
```

To insert the link to the footnote, use this format:

```html
<span class="hx-footnote1">[1]</span>
```

Replace the number 1 with the appropriate number. They don't need to be in order, or even to be numbers, strictly speaking. Then, farther down, insert a div like this one:

```html
<div class="hx-footnote-target1">
  <p>1. I am footnote number one.</p>
</div>
```

Make sure that the -target# at the end matches your -footnote# above.

You can put these divs anywhere; the javascript will move them to the end of the footnote component.

### Image Slider

For an image slider, copy the HTML below and alter to fit your purposes. Keep the classes.

```html
<div class="hx-sliderbox">
  <div class="hx-slider">
    <p>
      <img
        src="https://placebear.com/300/300"
        alt="placeholder bear"
      />Placeholder Bear
    </p>
    <p>
      <img
        src="https://placebear.com/250/250"
        alt="placeholder bear"
      />Placeholder Bear
    </p>
    <p>
      <img
        src="https://placebear.com/180/180"
        alt="placeholder bear"
      />Placeholder Bear
    </p>
    <p>
      <img
        src="https://placebear.com/150/150"
        alt="placeholder bear"
      />Placeholder Bear
    </p>
    <p>
      <img
        src="https://placebear.com/240/240"
        alt="placeholder bear"
      />Placeholder Bear
    </p>
    <p>
      <img
        src="https://placebear.com/240/240"
        alt="placeholder bear"
      />Placeholder Bear
    </p>
    <p>
      <img
        src="https://placebear.com/240/240"
        alt="placeholder bear"
      />Placeholder Bear
    </p>
    <p>
      <img
        src="https://placebear.com/240/240"
        alt="placeholder bear"
      />Placeholder Bear
    </p>
    <p>
      <img
        src="https://placebear.com/100/100"
        alt="placeholder bear"
      />Placeholder Bear
    </p>
    <p>
      <img
        src="https://placebear.com/200/200"
        alt="placeholder bear"
      />Placeholder Bear
    </p>
    <p>
      <img
        src="https://placebear.com/200/200"
        alt="placeholder bear"
      />Placeholder Bear
    </p>
  </div>
</div>
```

For a paired slider, where the top one acts as the navigation for the bottom one, copy the HTML below and alter to fit. Keep the classes.

```html
<div class="hx-sliderbox">
  <div class="hx-navslider">
    <p><img src="/static/img1.png" alt="" height="120px" /></p>
    <p><img src="/static/img2.png" alt="" height="120px" /></p>
    <p><img src="/static/img3.png" alt="" height="120px" /></p>
    <p><img src="/static/img4.png" alt="" height="120px" /></p>
    <p><img src="/static/img5.png" alt="" height="120px" /></p>
    <p><img src="/static/img6.png" alt="" height="120px" /></p>
    <p><img src="/static/img7.png" alt="" height="120px" /></p>
    <p><img src="/static/img8.png" alt="" height="120px" /></p>
  </div>

  <div class="hx-bigslider">
    <p>
      <a href="/static/img1.png" target="_blank"
        ><img src="/static/img1.png" alt=""/></a
      >Comments on image 1
    </p>
    <p>
      <a href="/static/img2.png" target="_blank"
        ><img src="/static/img2.png" alt=""/></a
      >Comments on image 2
    </p>
    <p>
      <a href="/static/img3.png" target="_blank"
        ><img src="/static/img3.png" alt=""/></a
      >Comments on image 3
    </p>
    <p>
      <a href="/static/img4.png" target="_blank"
        ><img src="/static/img4.png" alt=""/></a
      >Comments on image 4
    </p>
    <p>
      <a href="/static/img5.png" target="_blank"
        ><img src="/static/img5.png" alt=""/></a
      >Comments on image 5
    </p>
    <p>
      <a href="/static/img6.png" target="_blank"
        ><img src="/static/img6.png" alt=""/></a
      >Comments on image 6
    </p>
    <p>
      <a href="/static/img7.png" target="_blank"
        ><img src="/static/img7.png" alt=""/></a
      >Comments on image 7
    </p>
    <p>
      <a href="/static/img8.png" target="_blank"
        ><img src="/static/img8.png" alt=""/></a
      >Comments on image 8
    </p>
  </div>
</div>
```

### Dynamic Text Slider

You can put text into the image slider above. However, we've also made a _dynamic_ text slider, that pulls its slides from a CSV file and loads them only when needed. This is great for larger collections of data that students might want to examine and explore in detail. This takes a little more custom work.

See the [text slider](https://github.com/Colin-Fredericks/hx-js/tree/master/text%20slider)
folder for more detail.

### Video Links

This one is a little complex. Look at the structure below, which you can copy to use as a template. Paste it into a Raw HTML component directly beneath your video.

```html
<div id="hx-vidlinks-static-1" class="hx-vidlinks">
  <div data-time="9">
    <a href="http://astronomy.fas.harvard.edu/people/dimitar-sasselov">
      <img src="/static/hx_tiny_white.png" />
      Dimitar Sasselov - Harvard University
    </a>
  </div>

  <div data-time="17">
    <a href="https://en.wikipedia.org/wiki/Solar_System">
      <img src="/static/hx_tiny_white.png" />
      Our Solar System - Wikipedia
    </a>
  </div>

  <div data-time="27">
    <a href="http://planetquest.jpl.nasa.gov/">
      <img src="/static/hx_tiny_white.png" />
      Exoplanets - NASA.gov
    </a>
  </div>
</div>
```

The outer div has `hx-vidlinks-static-1`, because it's for video number one - the first one on the page. If I have a second video, it should say `hx-vidlinks-static-2` and so forth.

The inner divs have `data-time="9"` where the 9 means the link is going to show up nine seconds into the video. You can also specify times in minutes:seconds format, or even hours:minutes:seconds.

The image inside is a little HX. It's 25 pixels tall. Feel free to replace it with a different image that's also 25 pixels tall.

The javascript will turn this set of divs into a list of static links, for folks who can't see or get to the pop-up links.

If you _don't_ want to load this on a page, for instance on a page with a lot of videos that don't need links, you must set `hxLocalOptions.dontLoadVideoStuff` to `true`. You can't do this as a global option, because the global options are loaded along with the other scripts. It has to be done within the page.

### Easter Egg

Up up down down left right left right B A

### Jump To Time

Write a link that looks like this:

```html
<a href="#video1" class="hx-vidtime" data-time="0:34">Go to 34 seconds</a>
```

The pound sign at the beginning of the href is a pound sign. The _number_ at the _end_ of the href tells us which video you want on the page (the top one is #1). The time can be given in hh:mm:ss format, or mm:ss, or just in seconds.

The link will jump you to the appropriate video, cue it up to the right time, and start it playing.

This will even work with `/jump_to_id/` links! Just add the `#video1` or `#video2` or whatever at the end of URL.

If you want to go to a particular time in a video on the _same_ page, that's simpler. Write this instead:

```html
<a href="3:24" class="jumptime">Go to 3:24</a>
```

It'll affect the _top video on the page_. Optionally, you can add a `data-for-vidnum="N"` attribute to go to the Nth video on the page (the top one is video number 1).

### Pop-up Assessments

This is a little complicated. First, make a Raw HTML component right above or below your video.

Then, make a `<script>` tag in that component and put a "timer" objet into it like so:

```html
<script>
  var HXPUPTimer = [
    { time: '8.5', title: 'What Happened?' },
    { time: '4', title: 'What Game?' },
    { time: '12', title: 'What Was That?' },
    { time: '16', title: 'Collision' },
    { time: '18', title: 'Poll' }
  ];
</script>
```

The time can be in seconds, or in mm:ss, or hh:mm:ss format. The title is the _exact_ name of one of the problems farther down on your page. It should work with any problem type except for Peer-Evaluated.

Then, add this block of HTML for your controls. You shouldn't need to change anything here.

```html
<button id="hx-popUpPlayPause" aria-label="Start">
  <span id="hx-playpauseicon" class="hx-VQControls">&#8227;</span>
  <span id="hx-playpauseword">Play</span>
</button>
<button id="hx-popUpReset" aria-label="Answer Video Problems From Beginning">
  <span class="hx-VQControls">&#8617;</span> Restart
</button>
<button id="hx-backOneProblem" aria-label="Go Back One Question">
  <span class="hx-VQControls">&#8676;</span> Back One
</button>
<button id="hx-problemToggle" aria-label="Toggle Video Problems On/Off">
  <span id="hx-sunmoon" class="hx-VQControls">&#9788;</span>
  <span id="hx-onoff">Problems are On</span>
</button>
```

HX-js will do the rest!

To include items that do not have an h3 heading, such as a Word Cloud, make a small raw HTML component that includes the tag `<span style="display:none" class="hx-includer">includenext</span>`, and place that component directly before the one that you want to include. HX-js will display both items at once.

If you _don't_ want to load this on a page, for instance on a page with a lot of videos that don't need pop-up videos, you must set `hxLocalOptions.dontLoadVideoStuff` to `true`. You can't do this as a global option, because the global options are loaded along with the other scripts. It has to be done within the page.

### Automated Table of Contents for Long Pages

Either set `makeTOC: true,` in your hxGlobalOptions.js file, or put this little bit into a Raw HTML component on the page.

Warning: Once students see an Auto-TOC on one page, they'll see it on the rest of the pages in that subsection. You will probably want to set this to "true" or "false" manually on each page in a particular subsection.

```html
<script>
  var hxLocalOptions = { makeTOC: true };
</script>
```

This will auto-generate a hyperlinked table of contents from all visible h3 and h4 elements on your page, and drop it in the top-right-hand corner of the page.

Don't use this on pages where a video is the first thing. It will overlap and look ugly.

### Automated External Link Markers

Either set `markExternalLinks: true,` in your hxGlobalOptions.js file, or put this little bit into a Raw HTML component on the page.

```html
<script>
  var hxLocalOptions = { markExternalLinks: false };
</script>
```

Every link that is not to an edx.org site will be marked with [a box-and-arrow image](http://fontawesome.io/icon/external-link/) to let students know that it's an external link. It's even accessible for screen readers! Naturally, this only works on pages where you have HX-JS enabled, so you may need to manually need to add it in a few places where javascript doesn't work (like the wiki).

### Forum Tricks

Maybe you want in-page discussions, but you want them open right away so everyone can see all the different threads. Set `openPageDiscussion: true,` in your hxGlobalOptions.js file to automatically open every inline discussion as soon as someone comes to a page.

### Learner Backpack

First, follow the setup instructions for the [Learner Backpack](https://github.com/Stanford-Online/js-input-samples/tree/master/learner_backpack) javascript problem.

When HX-JS is running you will be able to use the javscript functions:

- hxSetData('whatever', stuff) will store the `stuff` object in the `whatever` variable.
- hxGetData('whatever') will get the contents of the `whatever` variable.
- hxClearData('whatever') will empty the `whatever` variable.

This data is stored in the edX server, up to about 100k per student per course.

### Rich Text Editor

Once you have the Backpack (see above) set up, you can create a rich-text editor for your learners to use!

In a Raw HTML component, insert this code:

```html
<p class="hx-editor" data-saveslot="journaling">
  [Editor not loaded yet]
</p>
```

HX-JS will automatically find it and turn it into an editor, via [Summernote](https://summernote.org/).

The `data-saveslot` attribute lets you select a different slot for each editor, or reuse them. If you have two editors with the same save slot, learners will see the same thing in each one. What they typed before is stored in the backpack and retrieved when they load a page.

## Future Features

### Intro.js walkthroughs

(coming - but difficult.)

### Audio Player

(coming - Luis is working on this.)

## Full List of Preferences and Settings

The object below is the full set of default settings for hx-js. You can override these either by putting them into the hxGlobalOptions.js file (higher priority), or by putting this hxLocalOptions object into a raw HTML element on your page (highest priority).

```html
<script>
  var hxLocalOptions = {
    // Table of Contents
    makeTOC: false,

    // Remove a lot of the navigation "chrome" - use only if you have just one page per unit.
    // This should only be used for older versions of OpenEdX before the 2017 navigation overhaul.
    collapsedNav: false,

    // Remove the "Add a Post" button and/or auto-open the on-page discussions.
    removeAddPostButton: false,
    openPageDiscussion: false,

    // Resize image maps when an image shrinks because of screen size
    resizeMaps: true,

    // Marks all external links with an icon.
    markExternalLinks: false,

    // Highlighter: Yellow highlights that start turned off and go back to transparent afterward.
    highlightColor: '#ff0',
    highlightBackground: 'rgba(0,0,0,0)',
    highlightState: true,
    // Code syntax highlighting
    highlightCode: true,

    // Default options for the Slick image slider
    slickOptions: {
      arrows: true,
      dots: true,
      focusOnChange: true,
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 3
    },
    // Default options for image slider navigation
    slickNavOptions: {
      asNavFor: '.hx-bigslider',
      variableWidth: true,
      focusOnSelect: true,
      slidesToShow: 3,
      slidesToScroll: 1
    },
    // Default options for single big image slider paired to nav.
    slickBigOptions: {
      asNavFor: '.hx-navslider',
      arrows: false,
      dots: true,
      fade: true,
      focusOnChange: true,
      adaptiveHeight: true,
      slidesToShow: 1,
      slidesToScroll: 1
    },
    // Default options for pop-up problems
    PUPOptions: {
      width: 800,
      effect: 'fade',
      effectlength: 200,
      myPosition: 'center',
      atPosition: 'center',
      ofTarget: window
    },
    // Default options for in-video links
    VidLinkOptions: {
      hideLinkAfter: 5, //seconds
      effect: 'slide',
      hide: { direction: 'down' },
      show: { direction: 'down' },
      speed: 500,
      location: 'bl' // Bottom Left. bl, br, tl, and tr are all ok.
    }
  };
</script>
```
