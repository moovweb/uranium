# Uranium Model #

## Attributes ##

Uranium uses declarative javascript. This means that the attributes that we add on the html tell the javascript what to do. Here are a few examples of uranium attributes on html elements:

    <div data-ur-set='toggler'>   </div>

    <span data-ur-toggler-component='button' data-ur-state='enabled'>   </span>

The naming convention here is worth discussing. In HTML4 adding attributes other than id/class/name isn't strictly to spec. But -- in HTML5, we can add custom attributes, so long as they're prefixed with 'data-'. The next part, the 'ur' you see, is uranium's periodic symbol! The last part of the attribute name is specific to the function / declaration you're making -- more on that below.

## How? ##

In making [widgets](../widgets/widgets.md), you'll really be performing three functions:

-  I. [Constructing Components](construction.md)
-  II. [Grouping Components](grouping.md)
-  III. [Observing States](states.md)

