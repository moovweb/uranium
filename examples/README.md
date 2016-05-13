The examples directory may be downloaded to your local machine and viewed directly in a browser by navigating to examples/index.html.

To edit the examples locally, you need to install the command-line utilites jekyll and Sass, along with their dependencies.

First, compile your SASS files by running:

`sass --watch examples/scss:examples/css --line-comments`

Then open a separate terminal process and start the jekyll server with:

`jekyll serve --watch`

A local `_examples` directory will be created for the local live preview, and it will be updated as you make changes to the source files in the `examples` directory. (Please do not commit the `_examples` directory when committing your changes.)

You will be able to navigate to localhost:4000 to see the examples running in your browser.

# Uranium examples included:

* [DONE] Toggler
* [DONE] Carousel
* [DONE] Zoom
* [DONE] Tabs
* [DONE] Geolocation
* [DONE] Input Clear
