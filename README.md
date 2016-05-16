# Overview for Uranium's GitHub Page

Found at [uranium.io](http://uranium.io).

## Getting started 

Start with installing [Jekyll](http://jekyllrb.com/) 

		gem install jekyll

Update the CSS:
		
		sass --watch stylesheets/scss:stylesheets --style compact

on the stylesheets folder to compile your Sass files and keep them updated.
			
In a separate terminal process, run the server (This will also listen for changes)

			jekyll serve --watch

Check it [out](http://localhost:4000/) after launching.

---
## Widgets Available

Carousel

- The carousel is a widget that allows horizontal scrolling (with touch or buttons) between a set of items.

Toggler

- A toggler is a widget that has two components - a button, and a set of contents.
- When you click the button, the states (of both the button and the contents) are toggled.

Tabs

- Tabs are kind of like togglers, but only one tab is active at a time. When you enable the state of one tab, another tab is disabled.

Geolocation

- This widget allows you to Geolocation a location. 
- You can use this to populate forms using the user's location. 
- You can only have one of these widgets per page

Zoom

- A widget that zooms into an image and displays a higher resolution image that can be panned.

Input Clear

- When a user focuses and begins typing on a text input field, a small x appears along the right side of the field that can be clicked to clear it. 
- If there is already text in the input field the x will appear without any typing.

---

## Uranium Overview

Uranium is a simple JavaScript interaction library written in jQuery. It's meant to be...

-  Lightweight
-  Declarative
-  Interface Focused

That's it!

If given the choice between easy to use and powerful, ease of use is the greater goal. 

View the [website](http://uranium.io/) for more details and demos.


---

## Easy to Use

**Uranium requires ZERO programming on your part.**

Uranium adopts the 'declarative' JavaScript style. Because of this, you can use the interactions just by editing your HTML and CSS, without touching a single line of JavaScript.

**What is declarative JavaScript?**

Declarative JavaScript is a model that looks for how html elements are formatted to construct all the necessary js magic to make those elements come to life. 

---


## Uranium is not ...

**...designed for executing logic or site functions**

The declarative JavaScript in Uranium is not designed for performing functions, but for enabling interactions. It's a bad idea to add attributes to an element to perform some JavaScript logic. This is exactly why onclicks should be avoided. If you want to execute site logic or perform functions, that's what events / listeners / callbacks are for. The declarative approach promoted by Uranium makes the view (your UI/UX) rely on the model (your HTML). 

**But I need to do x/y/z functions that Uranium doesn't handle !**

You're in luck! Uranium is designed to work with [jQuery](http://www.jquery.com) -- which (we think) provides a great set of convenient JavaScript functions along with some very useful cross-browser compatibility features. With this in mind, using Uranium gives you the best of both worlds -- its primary purpose is to make it easy to add great interaction -- but if you need to do something fancy, it makes sure the tools you need to do so concisely are also available.


---

## Building Uranium

If you're contributing to the code base, you need to test your changes and update the bundled JavaScript.

**Bundling**

Bundling uses the Google Closure Compiler to bundle the JavaScript. Don't worry -- part of the rake task is to install it for you! To perform the default build from inside your local copy of the Uranium repository, just do:

    cd build
    rake

This will read in the full JavaScript source in the lib/jquery.uranium.js file, and place both full-source and minified copies of Uranium in build/src/.

**Testing**

You need to go through all of the test cases under /examples and make sure that all the interactions still work. Of course, if you've added functionality, or a new interaction, you need to make a test example for your new cases as well and make sure those pass. It should be an example file that can be shown on the website.

---

## Building an Interaction

Fork Uranium. Build your interaction. Issue a Pull Request. Revel in glory.

If you're contributing to the code base, you need to test your changes and update the bundled JavaScript.

**Technical**

TODO: Information on how the code base should be structured, conventions, etc...

To get the examples running locally, start the jekyll server with:

`jekyll serve --watch`

In a separate terminal process, run  

`sass --watch stylesheets/scss:stylesheets --style compact`

on the stylesheets folder to compile your Sass files.

You will be able to navigate to [localhost:4000](localhost:4000) to see the examples running in your browser.

**Documentation**

You'll need to generate a .html file demonstrating the use of your new interaction. It goes in the examples folder, and should do the following things

* Provide documentation of all the attributes, CSS, and JS required to make the interaction go.
* At least one example of how the interaction can be used.

**Important Note**

If there are two versions of jQuery on a page, Uranium will break.  To avoid this, try to only use 1 instance of jQuery. If that is not possible, you will need to use jQuery.noConflict() on both instances.

---

## Future Wishlist

Uranium is an ongoing project and we're constantly looking to add useful features (that are within the scope of the ideals above).

Additional features to current interactions:

  - *Carousel*: "Stop autoscroll" button 
  - *Carousel*: Auto-populate clones on infinite scroll when container is larger than actual items
  - *Geocode*: Entering zipcode should find address
  - *Toggler*: Pass height for CSS animation tie-ins

New interactions:

  - Validation interaction for form inputs

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
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
