# Overview #

Uranium is meant to be :

-  Lightweight
-  Easy to use

That's it!

We've also found it to be quite powerful -- we think you'll find it useful in many settings. But, if given the choice between easy to use and powerful, ease of use is the greater goal. If you find yourself wanting something that a given widget will not do, you're encouraged to extend the widget yourself.

It should be noted that since Uranium extends xui -- this library is geared for widgets that are useful on mobile devices. It also is designed to support mobile browsers (for now just webkit, but you can [build](uranium/blob/master/doc/build.md) it for blackberry/mobile IE as well).

# Lightweight #

## The whole library is 6.5 KB gzipped (including all widgets and xui) ! ##

-  Uranium is based on [xui](http://xuijs.com/) -- the featherweight mobile js library
-  Uranium is bundled with xui to make just one javascript file. [Here](uranium/raw/master/build/uranium.js) it is.
-  If you want it even lighter, you can make a custom [build](uranium/blob/master/doc/build.md) yourself

# Easy to Use #

## Uranium requires ZERO programming on your part. ##

Uranium adopts the 'declarative' javascript style. Because of this, you can use the widgets without touching a single line of javascript.

## What is declarative javascript? ##
   
Declarative javascript is a model that looks for how html elements are formatted to construct all the necessary js magic to make those elements come to life. There are two primary steps to make a widget:

-  Add special attributes to the html element you wish to make a widget
-  Include [uranium.js](uranium/raw/master/build/uranium.js)

That's it.

## Get Started ##

-  Take a look at our [model](uranium/blob/master/doc/model.md) to see how to implement a widget
-  Take a look at our [examples](uranium/blob/master/tests) to see some implementation examples (to use the examples, just download the repo and open one of the test html files)


# Uranium is not ... #

## ... designed for executing logic or site functions ###

Uranium makes the view (your UI/UX) rely on the model (your HTML). The declarative aspect is not designed for performing functions. You wouldn't want to add attributes to an element to perform some js logic (this is exactly why onclicks should be avoided) -- thats what events / listeners / callbacks are for.

## But I need to do x/y/z functions that Uranium doesn't handle ! ##

You're in luck! Uranium bundles with xui -- which (we think) provides a great minimal set of convenient javascript functions (query, add-listeners, ajax, iterate, etc). With this in mind, Uranium is the best of both worlds -- its primary purpose is to make it easy to create great widgets UI/UX -- but if you need to do something fancy, it gives you the tools you need to do so concisely.

# MIT License #

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
