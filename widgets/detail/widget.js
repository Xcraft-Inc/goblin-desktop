import React from 'react';
import Widget from 'laboratory/widget';
import importer from 'laboratory/importer/';
import Container from 'gadgets/container/widget';

const widgetImporter = importer ('widget');

class Detail extends Widget {
  constructor () {
    super (...arguments);
  }

  static get wiring () {
    return {
      id: 'id',
      type: 'type',
      title: 'title',
      detailWidget: 'detailWidget',
      detailWidgetId: 'detailWidgetId',
    };
  }

  render () {
    const {id, title, detailWidget, detailWidgetId} = this.props;
    if (!id) {
      return null;
    }
    if (!detailWidget) {
      return null;
    }
    if (!detailWidgetId) {
      return null;
    }
    const DetailWidget = widgetImporter (detailWidget);
    const wireDetailWidget = Widget.Wired (DetailWidget);
    const WiredDetailWidget = wireDetailWidget (detailWidgetId);

    return (
      <Container kind="view-right" width="750px">
        <WiredDetailWidget />
      </Container>
    );
  }
}

export default Detail;
