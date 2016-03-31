# hx-js

HarvardX Standard Javascript and CSS
====================================

This project collects a large number of javascript and css tricks that have been used in various HX courses and puts them all in one place so that they're easier to implement.

We use require.js to preload some useful javascript while keeping the code modular.

How to Implement HXJS in your course
-----------

First, download [HXJS_Helper.zip](https://github.com/Colin-Fredericks/hx-js/raw/master/HXJS_Helper.zip) unzip it, and upload all of the things therein to your Files & Uploads section. This will let you use...

* [Video Links](https://github.com/Colin-Fredericks/edx-video-augments),
* [Slick](https://kenwheeler.github.io/slick/)-style image sliders,
* [intro.js](https://github.com/usablica/intro.js) text-based walkthroughs with some accessibility improvements,
* Underscore.js used to be included, but it's a standard part of edX, so we don't need it.

Also upload the three files from this repo:

* **hx.js**, which puts all the javascript in one place
* **hx.css**, which is all the css in one file
* **hxGlobalOptions.js**, which sets the global options for hx.js

Once you've done that, copy the lines below into a Raw HTML element:

```html
<script data-main="/static/hx" src="/static/require.js"></script>
<link rel="stylesheet" type="text/css" href="/static/hx.css">
```

That will enable hx.js for all components on that page. It should be doing exactly nothing so far.

To make things happen, you'll need to add specific classes to your HTML, and in some cases make little changes to your hxGlobalOptions.js file. Here's the full list of awesome stuff:

### Simple Appearance Changes

All of these are classes that you add to 

* For **drop caps**, do `<span class="hx-dropcap">A</span>` on the first letter.
* For **small-caps headers**, do `class="hx-smallcaps"`. Works with h3 or h4.
* For a **superbold** white header with a solid color background, do `class="hx-superbold"`. You can do small caps with this.
* For an **underlined** header, do `class="hx-underline"`. You can do small caps with this.
* For images or divs that hang down on the **right-hand side**, use `class="hx-hangright`.
* For images or divs that hang down on the **left-hand side**, use `class="hx-hangleft`.

### Pretty boxes

Blue boxes:

```html
<div class="hx-bluebox">
  <h4>Box Header</h4>
  <p>Other things in box</p>
</div>
```

Blue sidebars:

```html
<div class="hx-sidebar">
  <h4>Box Header</h4>
  <p>Other things in box</p>
</div>
```

Grey quotation/excerpt boxes:

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

Button 1 toggles target 1, button 2 toggles target 2, etc.

### Highlighter Toggle

This part makes the button:

```html
<p><button class="hx-highlighter1">Highlight Important Things</button></p>
```

Match the number on -highlighter# with the class in the following code:

```html
<span class="hx-highlight1">Thing To Highlight</span>
```

Each button highlights all the things with matching numbers. You don't need a different number for each highlight; you need a different number for each *set* of highlights.

### Pop-ups for clickable images

You will need an image map already prepared. I recommend https://www.image-maps.com/ to create one quickly.

Here's an example:

```html
<p class="hx-centered"><img src="https://placebear.com/500/300" alt="placeholder bear" usemap="#TheBearMap"/></p>

<map id="BearMap1" name="TheBearMap">
  <area id="Area1" class="Bear1 hx-popup-opener" title="Bear 1" shape="rect" coords="150,0,320,120" alt="Bear number one" />
  <area id="Area2" class="Bear2 hx-popup-opener" title="Bear 2" shape="rect" coords="90,120,350,300" alt="Bear number two" />
</map>
```

Note the classes, Bear1 and Bear2. You can name them anything you want, but *they need to be the first class.* The `hx-popup-opener` class is also necessary, but don't put it first. The javscript will then look for divs with matching classes. *They need to be divs.* Here's an example:

```html
<div class="Bear1 hx-popup-content">
  <p>I am bear #1!</p>
</div>
<div class="Bear2 hx-popup-content">
  <p>I am bear #2!</p>
</div>
```

You can put them anywhere; they'll hide until you need them. When you click on the areas, the divs pop up. 

Underneath, the javascript will automatically create a list with all of the targets, based on their "title" attribute. This list will also pop up the dialogs.

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
<p><img src="https://placebear.com/300/300" alt="placeholder bear"/>Placeholder Bear</p>
<p><img src="https://placebear.com/250/250" alt="placeholder bear"/>Placeholder Bear</p>
<p><img src="https://placebear.com/180/180" alt="placeholder bear"/>Placeholder Bear</p>
<p><img src="https://placebear.com/150/150" alt="placeholder bear"/>Placeholder Bear</p>
<p><img src="https://placebear.com/240/240" alt="placeholder bear"/>Placeholder Bear</p>
<p><img src="https://placebear.com/240/240" alt="placeholder bear"/>Placeholder Bear</p>
<p><img src="https://placebear.com/240/240" alt="placeholder bear"/>Placeholder Bear</p>
<p><img src="https://placebear.com/240/240" alt="placeholder bear"/>Placeholder Bear</p>
<p><img src="https://placebear.com/100/100" alt="placeholder bear"/>Placeholder Bear</p>
<p><img src="https://placebear.com/200/200" alt="placeholder bear"/>Placeholder Bear</p>
<p><img src="https://placebear.com/200/200" alt="placeholder bear"/>Placeholder Bear</p>
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
  <p><a href="/static/img1.png" target="_blank"><img src="/static/img1.png" alt="" /></a>Comments on image 1</p>
  <p><a href="/static/img2.png" target="_blank"><img src="/static/img2.png" alt="" /></a>Comments on image 2</p>
  <p><a href="/static/img3.png" target="_blank"><img src="/static/img3.png" alt="" /></a>Comments on image 3</p>
  <p><a href="/static/img4.png" target="_blank"><img src="/static/img4.png" alt="" /></a>Comments on image 4</p>
  <p><a href="/static/img5.png" target="_blank"><img src="/static/img5.png" alt="" /></a>Comments on image 5</p>
  <p><a href="/static/img6.png" target="_blank"><img src="/static/img6.png" alt="" /></a>Comments on image 6</p>
  <p><a href="/static/img7.png" target="_blank"><img src="/static/img7.png" alt="" /></a>Comments on image 7</p>
  <p><a href="/static/img8.png" target="_blank"><img src="/static/img8.png" alt="" /></a>Comments on image 8</p>
</div>
</div>
```

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

### Easter Egg

Up up down down left right left right B A

### Jump To Time

Write a link that looks like this:

```html
<a href="#video1" class="hx-vidtime" data-time="0:34">Go to 34 seconds</a>
```

The pound sign at the beginning of the href is a pound sign. The *number* at the end of the href tells us which video you want on the page (the top one is #1). The time is given in hh:mm:ss format, or mm:ss, or just in seconds. (Any of those will work.)

The link will jump you to the appropriate video, cue it up to the right time, and start it playing.

### Forum Tricks

(docs coming)

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