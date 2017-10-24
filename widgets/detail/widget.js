import React from 'react';
import Widget from 'laboratory/widget';
import importer from 'laboratory/importer/';
import Container from 'gadgets/container/widget';
import Workitem from 'desktop/workitem/widget';

const uiImporter = importer ('ui');

class Detail extends Widget {
  constructor () {
    super (...arguments);
  }

  static get wiring () {
    return {
      id: 'id',
      type: 'type',
      title: 'title',
      kind: 'kind',
      width: 'width',
      detailWidget: 'detailWidget',
      detailWidgetId: 'detailWidgetId',
    };
  }

  render () {
    const {id, kind, width, detailWidget, detailWidgetId} = this.props;
    if (!id) {
      return null;
    }
    if (!detailWidget) {
      return null;
    }
    if (!detailWidgetId) {
      return null;
    }

    const workitemUI = uiImporter (detailWidget);
    const DetailUI = workitemUI.read.full;
    const workitemId = `${detailWidget}@${detailWidgetId}`;
    return (
      <Container
        kind={kind ? kind : 'view-right'}
        width={width ? width : '750px'}
      >
        <Workitem
          kind="detail"
          id={workitemId}
          entityId={detailWidgetId}
          title={() => {
            return <div>Détails</div>;
          }}
          readonly="true"
        >
          <DetailUI id={workitemId} entityId={detailWidgetId} />
        </Workitem>
      </Container>
    );
  }
}

export default Detail;
