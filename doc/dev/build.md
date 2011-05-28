# Build #

If you're contributing to the code base, you need to test your changes and update the bundled javascript.

## Bundling ##

Bundling uses the Google Closure Compiler to bundle the javascript. Don't worry -- part of the rake task is to install if for you! To perform the default build, just do:

    cd build
    rake

That's it!

This will compile all the widgets with each flavor (BB/IE/webkit) of xui.

### Custom Bundling ###

The rake task really just reads the config files (e.g. webkit.yaml) to know how to bundle the javascript. The different versions also have different widget lists to reflect those widgets compatabile with that browser flavor.

If you want to omit certain widgets or make a custom build, you're welcome to do so locally (and can do so by making your own custom yaml file / build task).

## Testing ##

You need to go through all of the test cases under /examples and make sure that all the widgets still work. Of course, if you've added functionality or a new widget, you need to make a test example for your new cases as well and make sure those pass.
