# Goblin desktop
> "It is not for gnomes..."

Provide simple API for adding contexts, tabs, tasks, forms, status, notifications, hinters...

## Creating a desktop

Usualy we create a desktop in a start quest, for a laboratory:

```js
    // Create a desktop for laboratory
    const desktop = yield quest.createFor ('laboratory', labId, 'desktop', {
        labId: lab.id
    });
```

### create (labId, onChangeMandate)

#### labId (string)
The famouse laboratory identifier
looks like: `laboratory@some-long-uuid-v4`

#### onChangeMandate (optional string)
A quest to run when the user click the mandate top-left button
ex: `mandate.open`

## Describing the desktop

Adding context:

```js
    const docContext = {contextId: 'doc', name: 'Doc'};
    desktop.addContext (docContext);
```

### addContext (context)

#### context (context object)

- contextId: a context identifier, lower-case, used
for retreiving context tasks js files

- name: the displayed name

### Describe context tasks

You can write a `tasks.js` file in a folder named like the context id, in the widgets directory:

```js
// exemple path for this file:
// goblin-name/widgets/codispatch/tasks.js
export default [
  {
    text: 'Search', 
    glyph: 'search', 
    woritem: 'mission-search',
    payload: {} //dedicated payload of parameters for the workitem
  },
  {
    text: 'Mission',
    glyph: 'plus',
    woritem: 'mission-workflow',
    payload: {}
  },
];
```

### Creating tabs

Minimal tab API:

```js
desktop.addTab ({
    name: 'New tab',
    contextId: 'some-context',
    view: 'someview',
    workitemId: 'content@exemple-uuid-v4',
});
```
### addTab (tab)

#### tab (tab object)

- name: the displayed name

- contextId: a context identifier, where the tab will be displayed

- view: name of the view, when the tab is clicked,
import a `view.js` from a folder, named with this value

- workitemId: a unique identifier for wiring a workitem (an existing goblin instance widget) in the selected view


## Working withs form and hinters

todo





