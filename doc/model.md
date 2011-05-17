# Uranium Model #

## Attributes ##

Uranium uses declarative javascript. This means that the attributes that we add on the html tell the javascript what to do. Here are a few examples of uranium attributes on html elements:

    <div data-ur-set='toggler'>   </div>

    <span data-ur-toggler-component='button' data-ur-state='enabled'>   </span>

The naming convention here is worth discussing. In HTML4 adding attributes other than id/class/name isn't strictly to spec. But -- in HTML5, we can add custom attributes, so long as they're prefixed with 'data-'. The next part, the 'ur' you see, is uranium's periodic symbol! The last part of the attribute name is specific to the function / declaration you're making -- more on that below.

## How? ##

In making [widgets](uranium/blob/master/doc/widgets.md), you'll really be performing three functions:

### I. Making Components ###

-  Convention

   The thing you'll find yourself doing the most often is just defining the html in question's component type. Like so:

        <div data-ur-toggler-component='button'> Click Me </div>

   This tells the javascript two things:
      +  'This' div is part of a toggler
      +  'This' div is the button part of the toggler

   The general syntax here is:

        data-ur-{widget-type}='{widget-component-type}'

   Each widget will have slightly different component types, you can refer [here](widgets.md) for a brief spec, or look at the /tests directory for some built examples.

-  Custom properties
   
   A few widgets require more information than just their type. An example is the Zoom-Preview widget. The zoom image needs to be a large version of the normal image. The easiest way to accomplish this is to set the zoom-image's src to a modified version of the normal image's src (this integrates nicely with scene7, but will work just as well for your own urls). To accomplish this, we need to tell the components how to modify the incoming src url to the desired url. We can do this with a custom attribute! Like so:

   <code> &lt;img data-ur-zoom-preview-component='zoom_image' 
   data-ur-src-modifier-match='(some_attr=)(.*)' data-ur-src-modifier-replace='$1yesway' /&gt; </code>

### II. Grouping Components ###

Uranium needs to know which components belong to which widget. To do this, it associates widget components to a widget set. 

We know how to bind html elements to components, but not widget components to a widget set. Its likely that we'll have many widgets on a given page -- we need to make sure that the right components get grouped together to make the right widget(s). We'll continue our toggler example from above.

-  Group by structure (recommended)

   Grouping by html structure is easier in most situations, and a lot more readable. To defined a widget set, just set the 'data-ur-set' attribute to the widget type (e.g. 'toggler') on any element that is a common ancestor of all the widget components.

        <div data-ur-set='toggler'>
          <div data-ur-toggler-component='button'> Click Me </div>
          <div data-ur-toggler-component='content'> Show Me </div>
        </div>

   Its recommended that you add the set attribute to the first common ancestor. This method encourages well-organized (hierarchical) html.

-  Group by UID

   Grouping by unique ID should be reserved for instances in which you can't easily make the html hierarchical (e.g. adjacent rows in a table). The only requirement is that the data-ur-id be set to a value unique to the widget component set. Here is what it would look like for our example:

          <div data-ur-toggler-component='button' data-ur-id='Charlie'> Click Me </div>
          <div data-ur-toggler-component='content' data-ur-id='Charlie'> Show Me </div>


### III. Observing States ###

The widgets are assigned different states according to their function. A toggler button component will have either 'enabled' or 'disabled' states assigned to its 'data-ur-state' attribute. These attributes allow you to style the widget's UI appropriately. Since 'data-ur-state' is a bit of a mouthful in css, we highly recommend using [Sass](http://sass-lang.com/).

#### Styling practices ####
   
You can set the 'data-ur-state' of given components explicitly, or allow the uranium javascript to assign the default state. If a component has a state, its usually either 'enabled' or 'disabled'. There are certain situations (outlined in the /tests documentation) where you must assign a state to a widget component.

-  
   Lazy

   Don't set the 'data-ur-state' on your components. Uranium will assign the default state attributes to these elements when the widgets are initialized. 
      
   As an example, for our toggler example, I can not specify the state -- apply 'enabled' type styles to the elements by default (by using the [data-ur-toggler-component] selector) and only add 'state styles' for the disabled state, like so:
     
       [data-ur-toggler-component][data-ur-state='disabled'] {
           /* disabled styles, like: */
           display: none;
       }
      
   Usually, you can get away with this when you're only really styling on one of two possible states AND you know that all widgets of this type will have the 'lazy' default state behavior. 

-  
   Strict
      
   Strict styling is more well organized. You separate out the 'default' styles that you need for a component completely from the 'state' styles that can change based on the widget's state. 

   Additional advantages are: 
   -  you can mix and match initial states
   -  you will be able to match on the 'loaded' state (UPCOMING FEATURE)

   Here's an example that exploits the use of setting state explicitly. It highlights one content element at a time:

       <div data-ur-set='toggler'>
         <div data-ur-toggler-component='button' data-ur-state='enabled'> Click Me </div>
         <div data-ur-toggler-component='content' data-ur-state='enabled'> Show Me </div>
         <div data-ur-toggler-component='content' data-ur-state='disabled'> Show Different Me </div>
       </div>
          
    The style rules would look something like this:
     
        [data-ur-toggler-component='button'] {
          /* button styles */
          padding: 5px;
          border-radius: 5px;
        }
           
        [data-ur-toggler-component='button'][data-ur-state='enabled'] {
          background-color: green;
        }        
        
        [data-ur-toggler-component='button'][data-ur-state='disabled'] {
          background-color: red;
        }        
           
        [data-ur-toggler-component='content'] {
          /* content styles */
          display:inline-block;
        }
           
        [data-ur-toggler-component='content'][data-ur-state='enabled'] {
          opacity: 1.0;
        }        
           
        [data-ur-toggler-component='content'][data-ur-state='disabled'] {
          opacity: 0.5;
        }        

-  
   UX cues

   The data-ur-state can provide some valuable UX cues ripe for the picking. 

   (UPCOMING FEATURE):

   In addition to setting the initial state of a component, uranium will add the 'loaded' state to a component after the given component has been initialized (all the listeners have been bound and its ready for user interaction). This gives you the ability to add styles to all components when they're in the 'loading' state. You can do all of this with CSS 2 (which is supported on most ... all? ... devices) ! Here's a simple example:

       [data-ur-component='button']
         opacity: 0.5;
       }

       [data-ur-component='button'][data-ur-state~='loaded'] {
         opacity: 1.0;              
       }
        
   Note: The 'attribute_name=~word' attribute syntax just means that an attribute's value consists of space delimited words, one of which is the word we're looking for.