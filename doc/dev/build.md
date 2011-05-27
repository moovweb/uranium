# Build #

If you're contributing to the code base, you need to test your changes and update the bundled javascript.

## Bundling ##

Bundling uses the Google Closure Compiler to bundle the javascript. Don't worry -- part of the rake task is to install if for you! To perform the default build, just do:

    cd build
    rake

That's it!

This will compile all the widgets and the webkit version of xui.

### Custom Bundling ###

The rake task really just reads the webkit.yaml file to know how to bundle the javascript. If you want to use a different version of xui (for blackberry/ie), you're encouraged to make a new config yaml file (as well as update the Rakefile) and push it back! If you want to omit certain widgets or make a custom build, you're welcome to do so locally (and can do so by making your own custom yaml file / build task).

## Testing ##

You need to go through all of the test cases under /tests and make sure that all the widgets still work. Of course, if you've added functionality or a new widget, you need to make a test for your new cases as well and make sure those pass.
