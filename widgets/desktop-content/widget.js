import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';

/******************************************************************************/

class Content extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    const {desktopId, workitem} = this.props;
    if (!workitem) {
      return null;
    }
    return <React.Fragment>{workitem.get('id')}</React.Fragment>;
  }
}

/******************************************************************************/

const CurrentContent = Widget.connect((state, props) => {
  const context = state.get(`backend.${props.id}.current.workcontext`);
  const workitemId = state.get(
    `backend.${props.id}.current.workitems.${context}`
  );
  let workitem = null;
  if (workitemId) {
    workitem = state.get(`backend.${props.id}.workitems.${workitemId}`);
  }
  return {workitem, context};
})(Content);

export default CurrentContent;
