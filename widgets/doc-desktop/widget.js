import React from 'react';
import Widget from 'laboratory/widget';
import Container from 'gadgets/container/widget';
import Readme from '../../README.md';

class DesktopDoc extends Widget {
  constructor (props, context) {
    super (props, context);
  }

  renderPanel () {
    return (
      <Container kind="panes">
        <Container kind="pane">
          <Readme />
        </Container>
      </Container>
    );
  }

  render () {
    return (
      <Container kind="views">
        <Container kind="view">
          {this.renderPanel ()}
        </Container>
      </Container>
    );
  }
}

export default DesktopDoc;
