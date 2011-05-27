# Carousel #

## Function ##

The carousel is a widget to allow for horizontally scrolling (with touch or buttons) between a set of items. Click [here](uranium/blob/master/examples/carousel.html) for an example implementation (you'll need to download the repo to view the html).

## Setup ##

Below are the instructions for constructing the carousel widget. You will also need to [group](uranium/blob/master/doc/model/grouping.md) these components.

### Required ###

#### Components ####

Add the 'data-ur-carousel-component' attribute to all components:

##### View Container #####
*  The 'view-container' component should contain the 'scroll-container'
*  This is the container that will have no overflow -- so that you only see one item at a time

##### Scroll Container #####
*  The 'scroll-container' component should contain the 'item' components
*  This container will be translated to show different items in the carousel
*  This container's width will be set appropriately at runtime, but it assumes two things about its childrens' styles (see items)

##### Items #####
*  The 'item' components should be children of the scroll component
*  They can be any tag (img/div)
*  They must have float:left and display:inline / inline-block styles (so that the scroll container can accurately calculate the max width)

### Optional ###

#### Components ####

##### Count #####

You can make a 'count' component that will get updated to reflect the current item being shown

##### Buttons #####

You can add buttons to utilize the carousel. Set the data-ur-carousel-component attribute to 'button' on each of these elements. Then set the data-ur-carousel-button-type attribute to 'prev' and 'next' as appropriate.

#### Custom Attributes ####

##### Touch State #####

<!-- is it view container? or the data-ur-set? it should probably be the latter -->

Once the carousel is initialized, the view_container element will have a data-ur-touch attribute which will either be set to 'enabled' or 'disabled' to reflect whether or not touch events (or mouse events in the browser for debugging purposes) are enabled. This means you can swipe the carousel to use it. You can use this attribute to hide the buttons (if included) if touch is enabled.

To force the carousel to not use swipes, you can set this value to 'disabled'.

