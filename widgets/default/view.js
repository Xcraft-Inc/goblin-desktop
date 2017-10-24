import React from 'react';
import importer from 'laboratory/importer';
import Widget from 'laboratory/widget';
import View from 'laboratory/view';
import Container from 'gadgets/container/widget';
import Editor from 'desktop/editor/widget';

const viewImporter = importer ('view');
const widgetImporter = importer ('widget');

class DefaultView extends View {
  render () {
    const {workitemId} = this.props;
    if (!workitemId) {
      return null;
    }

    const workitem = workitemId.split ('@')[0];
    let wireWidget = null;
    let LeftPanel = null;

    if (workitem.endsWith ('-workitem')) {
      wireWidget = Widget.Wired (Editor);
      LeftPanel = wireWidget (workitemId);
    }

    if (workitem.endsWith ('-search')) {
      wireWidget = Widget.Wired (widgetImporter (workitem));
      LeftPanel = wireWidget (workitemId);
    }

    if (wireWidget === null || LeftPanel === null) {
      return <div>Unable to display {workitemId}</div>;
    }

    const DetailView = viewImporter ('detail');
    const HinterView = viewImporter ('hinter');
    return (
      <Container kind="views">
        <LeftPanel />
        <Container kind="row" grow="1">
          <HinterView />
        </Container>
        <DetailView />
      </Container>
    );
  }
}

export default DefaultView;
