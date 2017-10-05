import React from 'react';
import importer from 'laboratory/importer';
import Widget from 'laboratory/widget';
import View from 'laboratory/view';
import Container from 'gadgets/container/widget';

const widgetImporter = importer ('widget');
const viewImporter = importer ('view');

class EditorView extends View {
  render () {
    const {workitemId} = this.props;
    if (!workitemId) {
      return null;
    }
    const widget = workitemId.split ('@')[0];
    const wireWidget = Widget.Wired (widgetImporter (widget));
    const LeftPanel = wireWidget (workitemId);
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

export default EditorView;
