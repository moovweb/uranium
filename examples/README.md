The examples directory may be downloaded to your local machine and viewed directly in a browser by navigating to examples/index.html.

To edit the examples locally, you need to install the command-line utilites jekyll and sass, along with their dependencies. Then start the jekyll server with:

`jekyll serve --watch`

In a separate terminal process, run  

`sass --watch examples/scss:_examples/css --line-comments --compass`

on the stylesheets folder to compile your SASS files.

A local `_examples` directory will be created for the local live preview, and it will be updated as you make changes to the source files in the `examples` directory. (Please do not commit the `_examples` directory when committing your changes.)

You will be able to navigate to localhost:4000 to see the examples running in your browser.

# Uranium examples included:
* [DONE] Toggler
* [DONE] Tabs
* [DONE] Input Clear
* [DONE] Geolocation
* [DONE] Zoom
* [DONE] Carousel

## TODO

	* Wish List:
		* stop autoscroll button
		* auto populate clones on infinite scroll when container is way larger than actual items
		* pass height with toggler for CSS animation tie-ins
