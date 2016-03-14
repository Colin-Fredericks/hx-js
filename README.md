# hx-js

HarvardX Standard Javascript and CSS
====================================

This project collects a large number of javascript and css tricks that have been used in various HX courses and puts them all in one place so that they're easier to implement.

How to Implement HXJS in your course
-----------

First, download HXJS_Helper.zip, unzip it, and upload all of the things therein to your Files & Uploads section. This will let you use...

* [Video Links](https://github.com/Colin-Fredericks/edx-video-augments)
* [Slick](https://kenwheeler.github.io/slick/)-style image sliders
* [intro.js](https://github.com/usablica/intro.js) text-based walkthroughs with some accessibility improvements
* and underscore.js, just in case we end up wanting it for something.

Also upload the three files from this repo:

* hx.js, which puts all the javascript in one place
* hx.css, which is all the css in one file
* hxGlobalOptions.js, which sets the global options for hx.js

Once you've done that, copy the lines below into a Raw HTML element:

`<script src="/static/hx.js"></script>`
`<link rel="stylesheet" type="text/css" href="/static/hx.css">`

That will enable hx.js for all components on that page. It should be doing exactly nothing so far.

To make things happen, you'll need to add specific classes to your HTML. Specifically:

### Visibility Toggle

### Highlighter Toggle

### Forum Tricks

### Pop-ups for clickable images

### Automated Footnotes

### Image Slider

### Video Links

### Easter Egg

Up up down down left right left right B A

### Intro.js walkthroughs

(coming)

### Pop-up Assessments

(coming)

### Audio Player

(coming)

### Automated Table of Contents for Long Pages

(coming)

Future Improvements
--------------

* Various functionality additions
* Minified version
* Getting this to work globally throughout a course without needing to load it on each page.