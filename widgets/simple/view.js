//T:2019-02-27

import React from 'react';
import importer from 'goblin_importer';
import Widget from 'goblin-laboratory/widgets/widget';
import View from 'goblin-laboratory/widgets/view';
import Container from 'goblin-gadgets/widgets/container/widget';

const widgetImporter = importer('widget');

class SimpleView extends View {
  render() {
    const {workitemId} = this.props;
    if (!workitemId) {
      return null;
    }

    const workitem = workitemId.split('@')[0];
    const WiredWidget = Widget.Wired(widgetImporter(workitem));
    return (
      <Container kind="views">
        <WiredWidget id={workitemId} />
      </Container>
    );
  }
}

export default SimpleView;
