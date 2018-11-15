import React from 'react';
import View from 'laboratory/view';
import Container from 'gadgets/container/widget';
import EntityList from 'desktop/entity-list/widget';

class EntityListView extends View {
  render() {
    const {workitemId} = this.props;
    if (!workitemId) {
      return null;
    }
    return <EntityList id={workitemId} />;
  }
}

export default EntityListView;
