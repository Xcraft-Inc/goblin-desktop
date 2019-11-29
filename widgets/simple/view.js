//T:2019-02-27

import React from 'react';
import importer from 'goblin/importer';
import Widget from 'laboratory/widget';
import View from 'laboratory/view';
import Container from 'gadgets/container/widget';

const widgetImporter = importer('widget');

class SimpleView extends View {
  render() {
    const {workitemId} = this.props;
    if (!workitemId) {
      return null;
    }

    const workitem = workitemId.split('@')[0];
    const wireWidget = Widget.Wired(widgetImporter(workitem));
    const WiredWidget = wireWidget(workitemId);
    return (
      <Container kind="views">
        <WiredWidget />
      </Container>
    );
  }
}

export default SimpleView;
