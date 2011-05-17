# Overview #

Uranium is meant to be :

-  Lightweight
-  Easy to use

That's it!

We've also found it to be quite powerful -- we think you'll find it useful in many settings. But, if given the choice between easy to use and powerful, ease of use is the greater goal. If you find yourself wanting something that a given widget will not do, you're encouraged to extend the widget yourself.

It should be noted that since Uranium extends xui -- this library is geared for widgets that are useful on mobile devices. It also is designed to support mobile browsers (for now just webkit ... will include a build option for blackberry).

# Lightweight #

## The whole library is 6.5 KB gzipped (including all widgets and xui) ! ##

-  Uranium is based on [xui](http://xuijs.com/) -- the featherweight mobile js library
-  Uranium is bundled with xui to make just one javascript file. [Here](uranium/raw/master/build/uranium.js) it is.
-  If you want it even ligher, you can make a custom [build](uranium/blob/master/doc/build.md) yourself

# Easy to Use #

## Uranium requires ZERO programming on your part. ##

Uranium adopts the 'declarative' javascript style. Because of this, you can use the widgets without touching a single line of javascript.

## What is declarative javascript? ##
   
Declarative javascript is a model that looks for how html elements are formatted to construct all the necessary js magic to make those elements come to life. There are two primary steps to make a widget:

-  Add special attributes to the html element you wish to make a widget
-  Include [uranium.js](uranium/raw/master/build/uranium.js)

That's it.

## Get Started ##

-  Take a look at our [examples](uranium/blob/master/tests) in '/tests' to see exactly how the widgets work
-  Take a look at our [model](uranium/blob/master/doc/model.md) to see how to implement a widget

# What Uranium is not #
  
  (TODO : reword this to make it more concise)

  Uranium is not designed for executing logic or site functions. Uranium makes the view (your UI/UX) rely on the model (your HTML). The declarative aspect is not designed for performing functions. You wouldn't want to add attributes to an element to perform some js logic (wait a second .... onclicks anyone ... haha) -- thats what events / listeners / callbacks are for. But -- uranium bundles with xui -- which (we think) provides a great minimal set of convenient javascript functions (query, add-listeners, ajax, iterate, etc). With this in mind, we see uranium as a double-solution -- its primary purpose is to make great widgets UI/UX -- but if you need to do something fancy, it gives you the tools you need to do it concisely.