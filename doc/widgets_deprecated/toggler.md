This documentation file is deprecated. All changes should be now be made in the examples/site folder

---
# Toggler #

## Function ##

The toggler alternates the states (enabled/disabled) of all of its 'content' components when the 'button' component is clicked. The states are toggled no matter what their value (so the button and content elements can all have different states).

Click [here](../../examples/toggler.html) for an example implementation (you'll need to download the repo to view the html).

## Setup ##

Below are the instructions for constructing the toggler widget. You will also need to [group](../model/grouping.md) these components.

### Required ###

#### Components ####

Add the 'data-ur-toggler-component' attribute to all components. Set this attribute to 'button' for the single button. Set this attribute to 'content' for all of the content elements.

### Optional ###

#### Components ####

You may have more than one 'content' component per toggler group.

#### States ####

You do not need to specify the state by default. If you do not specify the state, then it will get the 'disabled' state upon initialization.