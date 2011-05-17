# Uranium Model #

## Attributes ##

Uranium uses declarative javascript. This means that the attributes that we add on the html tell the javascript what to do. Here are a few examples of uranium attributes on html elements:

    <div data-ur-set='toggler'>   </div>

    <span data-ur-toggler-component='button' data-ur-state='enabled'>   </span>

The naming convention here is worth discussing. In HTML4 adding attributes other than id/class/name isn't strictly to spec. But -- in HTML5, we can add custom attributes, so long as they're prefixed with 'data-'. The next part, the 'ur' you see, is uranium's periodic symbol! The last part of the attribute name is specific to the function / declaration you're making -- more on that below.

## How? ##

In making widgets, you'll really be performing three functions:

### I. Making Components ###

-  
   #### Convention ####

   The thing you'll find yourself doing the most often is just defining the html in question's component type. Like so:

        <div data-ur-toggler-component='button'> Click Me </div>

   This tells the javascript two things:
      +  'This' div is part of a toggler
      +  'This' div is the button part of the toggler

   The general syntax here is:

        data-ur-{widget-type}='{widget-component-type}'

   Each widget will have slightly different component types, you can refer [here](widgets.md) for a brief spec, or look at the /tests directory for some built examples.

-  
   #### Custom properties ####
   
   A few widgets require more information than just their type. An example is the Zoom-Preview widget. The zoom image needs to be a large version of the normal image. The easiest way to accomplish this is to set the zoom-image's src to a modified version of the normal image's src (this integrates nicely with scene7, but will work just as well for your own urls). Do accomplish this, we need to tell the components how to modify the incoming src url to the desired url. We can do this with a custom attribute! Like so:

   <code> &lt;img data-ur-zoom-preview-component='zoom_image' data-ur-src-modifier-match='(some_attr=)(.*)' data-ur-src-modifier-replace='$1yesway' /&gt; </code>

### II. Grouping Components ###

Uranium needs to know which components belong to which widget. To do this, it associates widget components to a widget set. 

We know how to bind html elements to components, but not widget components to a widget set. Its likely that we'll have many widgets on a given page -- we need to make sure that the right components get grouped together to make the right widget(s). We'll continue our toggler example from above.

-  
   #### Group by structure (recommended) ####

   Grouping by html structure is easier in most situations, and a lot more readable. To defined a widget set, just set the 'data-ur-set' attribute to the widget type (e.g. 'toggler') on any element that is a common ancestor of all the widget components.

        <div data-ur-set='toggler'>
          <div data-ur-toggler-component='button'> Click Me </div>
          <div data-ur-toggler-component='content'> Show Me </div>
        </div>

   Its recommended that you add the set attribute to the first common ancestor. This method encourages well-organized (hierarchical) html.

-  
   #### Group by UID ####

   Grouping by unique ID should be reserved for instances in which you can't easily make the html hierarchical (e.g. adjacent rows in a table). The requirement is that the data-ur-id be set to a value unique to the widget component set. Here is what it would look like for our example:

          <div data-ur-toggler-component='button' data-ur-id='Charlie'> Click Me </div>
          <div data-ur-toggler-component='content' data-ur-id='Charlie'> Show Me </div>


### III. Observing States ###
-  
   #### Styling practices ####
   -  lazy
   -  strict
-  
   #### UX cues ####

   The data-ur-state can provide some valuable UX cues ripe for picking. 

   (UPCOMING FEATURE):

   In addition to setting the initial state of a component, uranium will add the 'loaded' state to a component after the given component has been initialized (all the listeners have been bound and its ready for user interaction). This gives you the ability to add styles to all components when they're in the 'loading' state. You can do all of this with CSS 2 (which is supported on most ... all? ... devices) ! Here's a simple example:

       [data-ur-component='button']
         opacity: 0.5;
       }

       [data-ur-component='button'][data-ur-state~='loaded'] {
         opacity: 1.0;              
       }
        
