# Build #

If you're contributing to the code base, you need to test your changes and update the bundled javascript.

## Testing ##

You need to go through all of the test cases under /tests and make sure that all the widgets still work. Of course, if you've added functionality or a new widget, you need to make a test for your new cases as well and make sure those pass.

## Bundling ##

Bundling uses the Google Closure Compiler to bundle the javascript. In order to do this, you must have the GCC installed locally. You can get it [here](http://code.google.com/closure/compiler/).

Once you have GCC installed, just run:

    rake webkit

Which will compile all the widgets and the webkit version of xui. This command really reads the webkit.yaml file to know how to bundle the javascript. If you want to omit certain widgets or use another xui version, you're welcome to do so locally.

