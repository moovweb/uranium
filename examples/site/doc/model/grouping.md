# Grouping #

Uranium needs to know which components belong to which widget (you could have many). To do this, it associates widget components to a widget set. 

## Group by structure (recommended) ##

Grouping by html structure is easier in most situations, and a lot more readable. To define a widget set, just set the 'data-ur-set' attribute to the widget type (e.g. 'toggler') on any element that is a common ancestor of all the widget components:

    <div data-ur-set='toggler'>
      <div data-ur-toggler-component='button'> Click Me </div>
      <div data-ur-toggler-component='content'> Show Me </div>
    </div>

Its recommended that you add the set attribute to the first common ancestor. This method encourages well-organized (hierarchical) html.

Note: Its perfectly fine (and good practice in many cases) for the 'data-ur-set' attribute to be on the same element as a 'data-ur-*-component' attribute.

## Group by UID ##

Grouping by unique ID should be reserved for instances in which you can't easily make the html hierarchical (e.g. adjacent rows in a table, or if the container already has a data-ur-set attribute ). The only requirement is that the 'data-ur-id' attribute be set to a value unique to the widget component set:

    <div data-ur-toggler-component='button' data-ur-id='Charlie'> Click Me </div>
    <div data-ur-toggler-component='content' data-ur-id='Charlie'> Show Me </div>
