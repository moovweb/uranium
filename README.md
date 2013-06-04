# Overview for the Github Page

---
# Getting started 

Start with installing [Jekyll](http://jekyllrb.com/) 
			gem install jekyll

Update the CSS
			sass --watch stylesheets/scss:stylesheets --line-comments --compass on the stylesheets folder to compile your SASS files.
			
Run the server
			jekyll serve 

Check it [out](http://localhost:4000/) after launching

---
# Widgets Available
Carousel

- The carousel is a widget that allows horizontal scrolling (with touch or buttons) between a set of items.

Toggler

- A toggler is a widget that has two components - a button, and a set of contents.
- When you click the button, the states (of both the button and the contents) are toggled.

Tabs

- Tabs are kind of like togglers, but only one tab is active at a time. When you enable the state of one tab, another tab is disabled.

Reverse Geocode

- This widget allows you to reverse geocode a location. 
- You can use this to populate forms using the user's location. 
- You can only have one of these widgets per page

Zoom

- A widget that zooms into an image and displays a higher resolution image that can be panned.

Input Clear

- When a user focuses and begins typing on a text input field, a small x appears along the right side of the field that can be clicked to clear it. 
- If there is already text in the input field the x will appear without any typing.


# Uranium Overview

Uranium is meant to be :

-  Lightweight
-  Easy to use

That's it!

If given the choice between easy to use and powerful, ease of use is the greater goal. If you find yourself wanting something that a given widget will not do, you're encouraged to extend the widget yourself.

It should be noted that since Uranium extends xui -- this library is geared for widgets that are useful on mobile devices. It also is designed to support mobile browsers (for now just webkit, but you can build it for blackberry/mobile IE as well).

View the [website](http://uraniumjs.com/) for more details and demos.

---

# Lightweight

**The whole library is 15 KB gzipped (including all widgets and xui) !**

-  Uranium is based on [xui](http://xuijs.com/) -- the featherweight mobile js library
-  Uranium is bundled with xui to make just one javascript file(uranium/raw/master/build/src/uranium.js).
-  If you want it even lighter, you can make a custom [build](uranium/blob/master/doc/dev/build.md) yourself. Follow the instructions below.

---

# Easy to Use

**Uranium requires ZERO programming on your part.**

Uranium adopts the 'declarative' javascript style. Because of this, you can use the widgets without touching a single line of javascript.

**What is declarative javascript?**

Declarative javascript is a model that looks for how html elements are formatted to construct all the necessary js magic to make those elements come to life. 

---

# Get Started

There are two primary steps to make a widget:

-  Add special attributes to the html element you wish to make a widget
-  Include [uranium.js](uranium/raw/master/build/src/uranium.js)

View the [website](http://uraniumjs.com/) for a [tutorial](http://uraniumjs.com/tutorials.html) (we have videos!), more details, and awesome [demos](http://uraniumjs.com/widget_list.html).

-  Read our [philosophy](http://uraniumjs.com/more.html) to understand our design goals and see how to implement a widget.
-  Admire all the [widgets](http://uraniumjs.com/widget_list.html) available.

---

# Uranium is not ...

**... designed for executing logic or site functions**

Uranium makes the view (your UI/UX) rely on the model (your HTML). The declarative aspect is not designed for performing functions. You wouldn't want to add attributes to an element to perform some js logic (this is exactly why onclicks should be avoided) -- thats what events / listeners / callbacks are for.

**But I need to do x/y/z functions that Uranium doesn't handle !**

You're in luck! Uranium bundles with xui -- which (we think) provides a great minimal set of convenient javascript functions (query, add-listeners, ajax, iterate, etc). With this in mind, Uranium is the best of both worlds -- its primary purpose is to make it easy to create great widgets UI/UX -- but if you need to do something fancy, it gives you the tools you need to do so concisely.


---

# Building Uranium

If you're contributing to the code base, you need to test your changes and update the bundled javascript.

**Bundling**

Bundling uses the Google Closure Compiler to bundle the javascript. Don't worry -- part of the rake task is to install it for you! To perform the default build, just do:

    cd build
    rake

This will compile all the widgets with each flavor (BB/IE/webkit) of xui.

**Custom Bundling**

The rake task really just reads the config files (e.g. webkit.yaml) to know how to bundle the javascript. The different versions also have different widget lists to reflect those widgets compatible with that browser flavor.

If you want to omit certain widgets or make a custom build, you're welcome to do so locally (and can do so by making your own custom yaml file / build task). This is a great way to only build a smaller version of the specific widgets that you'll need.

**Testing**

You need to go through all of the test cases under /examples and make sure that all the widgets still work. Of course, if you've added functionality or a new widget, you need to make a test example for your new cases as well and make sure those pass. It should be an example file that can be shown on the website.

---

# Building a Widget

Fork Uranium. Build your widget. Issue a Pull Request. Revel in glory.

If you're contributing to the code base, you need to test your changes and update the bundled javascript.

**Technical**

TODO: Information on how the code base should be structured, conventions, etc...

Start the jekyll server with `jekyll --server`

Run `sass --watch stylesheets/scss:stylesheets --line-comments --compass` on the stylesheets folder to compile your SASS files.

**Documentation**

You'll need to generate an .html file that goes in the _site/widgets folder that should do the following things

* Provide documentation of all the attributes, CSS, and JS required to make the widget go.
* At least one example of how the widget can be used.

---

# MIT License

Copyright (C) 2011 by Moov Corporation (aka Moovweb)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
