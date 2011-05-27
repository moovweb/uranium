# Select Buttons #

## Function ##

The select-button widget binds two buttons to a <select> to increment/decrement the select's chosen value.

## Setup ##

Below are the instructions for constructing the select-buttons widget. You will also need to [group](../model/grouping.md) these components.

### Required ###

#### Components ####

Add the 'data-ur-select-buttons-component' attribute to all components:
  *  Set this attribute to 'select' for the <select> element
  *  Set this attribute to 'increment' for the increment button element
  *  Set this attribute to 'decrement' for the decrement button element

### Optional ###

#### States ####

Its recommended that you add the 'disabled' state (by setting the data-ur-state attribute) to the decrement button since its likely your <select> element has the first option selected by default.