# Select List #

TODO: Update the list value attribute syntax.

## Function ##

The select-list binds a set of uranium-elements to corresponding &lt;option&gt; elements of a &lt;select&gt;. Clicking the uranium-element sets the &lt;select&gt;'s value to match the corresponding &lt;option&gt; element.

Click [here](../../examples/select_list.html) for an example implementation (you'll need to download the repo to view the html).

## Setup ##

Below are the instructions for constructing the select-list widget. You will also need to [group](../model/grouping.md) these components.

### Required ###

#### Components ####

*  Add the 'data-ur-list-component' attribute to all components. 
   *  Set this attribute to 'select' on the &lt;select&gt; element
   *  Set this attribute to 'content' on the element containing your list of fake option elements
*  Make sure your list of fake option elements have 'value' attributes that match the corresponding &lt;option&gt;'s in the &lt;select&gt;

#### States ####

Right now, setting states on the fake option elements will have no effect. By default -- no option is selected initially.
