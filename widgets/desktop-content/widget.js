import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import importer from 'goblin_importer';
/******************************************************************************/
const viewImporter = importer('view');
class Content extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    const {desktopId, workitem, dialogId, context} = this.props;

    let wid;
    let view;
    if (workitem) {
      wid = workitem.get('id');
      view = workitem.get('view');
    } else if (!dialogId) {
      return null;
    }

    if (wid === dialogId) {
      //avoid display same content in tab
      wid = null;
    }

    if (!view) {
      view = 'default';
    }

    const View = viewImporter(view);
    return (
      <View
        desktopId={desktopId}
        context={context}
        workitemId={wid}
        dialogId={dialogId}
      />
    );
  }
}

/******************************************************************************/

const CurrentContent = Widget.connect((state, props) => {
  const context = state.get(`backend.${props.id}.current.workcontext`);

  const dialogId = state.get(`backend.${props.id}.current.dialogs.${context}`);
  const workitemId = state.get(
    `backend.${props.id}.current.workitems.${context}`
  );
  let workitem = null;
  if (workitemId) {
    workitem = state.get(`backend.${props.id}.workitems.${workitemId}`);
  }
  return {workitem, dialogId, context};
})(Content);

export default CurrentContent;
