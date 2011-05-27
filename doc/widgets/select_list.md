# Select List #

TODO: Update the list value attribute syntax.

## Function ##

The select-list binds a set of uranium-elements to corresponding <option> elements of a <select>. Clicking the uranium-element sets the <select>'s value to match the corresponding <option> element.

## Setup ##

Below are the instructions for constructing the select-list widget. You will also need to [group](../model/grouping.md) these components.

### Required ###

#### Components ####

*  Add the 'data-ur-list-component' attribute to all components. 
  *  Set this attribute to 'select' on the <select> element
  *  Set this attribute to 'content' on the element containing your list of fake option elements
* Make sure your list of fake option elements have 'value' attributes that match the corresponding <option>'s in the <select>

#### States ####

Right now, setting states on the fake option elements will have no effect. By default -- no option is selected initially.
