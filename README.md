# Overview

Uranium is a simple Javascript widget library written in jQuery. It's meant to be...

-  Lightweight
-  Declarative
-  Interface Focused

That's it!

If given the choice between easy to use and powerful, ease of use is the greater goal. 
If you find yourself wanting something that a given widget will not do, you're encouraged 
to extend the widget yourself.

View the [website](http://uraniumjs.com/) for more details and demos.


---

# Easy to Use

**Uranium requires ZERO programming on your part.**

Uranium adopts the 'declarative' javascript style. Because of this, you can use the widgets without touching a single line of javascript.

**What is declarative javascript?**

Declarative javascript is a model that looks for how html elements are formatted to construct all the necessary js magic to make those elements come to life. 

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

**Important Note**

If there are two versions of jQuery on a page, Uranium will break.  To avoid this, try to only use 1 instance of jQuery, 
if that is not possible, you would need to use jQuery.noConflict() on both instances.

---

# MIT License

Copyright (C) 2011-2013 by Moov Corporation (aka Moovweb)

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
