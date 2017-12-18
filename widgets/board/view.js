import React from 'react';
import importer from 'laboratory/importer';
import Widget from 'laboratory/widget';
import View from 'laboratory/view';
import Container from 'gadgets/container/widget';
import Board from 'desktop/board/widget';

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
    let BoardWorkitem = null;

    if (workitem.endsWith ('-workitem')) {
      wireWidget = Widget.Wired (Board);
      BoardWorkitem = wireWidget (workitemId);
    }

    if (wireWidget === null || BoardWorkitem === null) {
      return <div>Unable to display {workitemId}</div>;
    }

    //const DetailView = viewImporter ('detail');
    //const HinterView = viewImporter ('hinter');
    return (
      <Container kind="tickets-root">
        <BoardWorkitem />
      </Container>
    );
  }
}

export default DefaultView;
