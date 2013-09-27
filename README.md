# Uranium

## Overview

Uranium is a simple Javascript interaction library written in jQuery. It's meant to be...

-  Lightweight
-  Declarative
-  Interface Focused

That's it!

If given the choice between easy to use and powerful, ease of use is the greater goal. 

View the [website](http://uranium.io/) for more details and demos.


---

## Easy to Use

**Uranium requires ZERO programming on your part.**

Uranium adopts the 'declarative' Javascript style. Because of this, you can use the interactions just by editing your HTML and CSS, without touching a single line of Javascript.

**What is declarative Javascript?**

Declarative Javascript is a model that looks for how html elements are formatted to construct all the necessary js magic to make those elements come to life. 

---


## Uranium is not ...

**...designed for executing logic or site functions**

The declarative Javascript in Uranium is not designed for performing functions, but for enabling interactions. It's a bad idea to add attributes to an element to perform some Javascript logic. This is exactly why onclicks should be avoided. If you want to execute site logic or perform functions, that's what events / listeners / callbacks are for. The declarative approach promoted by Uranium makes the view (your UI/UX) rely on the model (your HTML). 

**But I need to do x/y/z functions that Uranium doesn't handle !**

You're in luck! Uranium is designed to work with [jQuery](http://www.jquery.com) – which (we think) provides a great set of convenient Javascript functions along with some very useful cross-browser compatibility features. With this in mind, using Uranium gives you the best of both worlds – its primary purpose is to make it easy to add great interaction – but if you need to do something fancy, it makes sure the tools you need to do so concisely are also available.


---

## Building Uranium

If you're contributing to the code base, you need to test your changes and update the bundled Javascript.

**Bundling**

Bundling uses [fusion](http://rubygems.org/gems/fusion) to bundle the Javascript. This means you have to install the fusion ruby gem before you can run the build process. To perform the default build from inside your local copy of the Uranium repository, just do:
		
		gem install fusion
    cd build
    rake

This will read in the full Javascript source in the lib/jquery.uranium.js file, and place both full-source and minified copies of Uranium in build/src/.

**Testing**

You need to go through all of the test cases in the /examples/index.html file and make sure that all the interactions still work. Of course, if you've added functionality, or a new interaction, you need to make a test example for your new cases as well and make sure those pass. It should be an example file that can be shown on the website.

---

## Building an Interaction

Fork Uranium. Build your interaction. Issue a Pull Request. Revel in glory.

If you're contributing to the code base, you need to test your changes and update the bundled Javascript.

**Technical**

TODO: Information on how the code base should be structured, conventions, etc...

To get the examples running locally, start the jekyll server with:

`jekyll serve --watch`

In a separate terminal process, run  

`sass --watch examples/scss:_examples/css --line-comments --compass`

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

## MIT License

Copyright (C) 2011-2013 by Moov Corporation (aka Moovweb)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
