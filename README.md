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

```html
<script src="/static/hx.js"></script>
<link rel="stylesheet" type="text/css" href="/static/hx.css">
```

That will enable hx.js for all components on that page. It should be doing exactly nothing so far.

To make things happen, you'll need to add specific classes to your HTML. Specifically:

### Simple Appearance Changes

* For Drop Caps, do `<span class="hx-dropcap">F</span>`
* For Small-Caps headers, do 

### Visibility Toggle

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

### Forum Tricks

### Pop-ups for clickable images

### Automated Footnotes

To insert the link to the footnote, use this format:

```html
<span class="hx-footnote1">[1]</span>
```

where you replace the number 1 with the appropriate number. They don't need to be in order, or even to be numbers, strictly speaking. Then, farther down, insert a div like this one:

```html
<div class="hx-footnote-target1">
  <p>1. I am footnote number one.</p>
</div>
```

Make sure that the -target# at the end matches your -footnote# above.

### Image Slider

For an image slider, copy the HTML below and alter to fit your purposes. Keep the classes.

```
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