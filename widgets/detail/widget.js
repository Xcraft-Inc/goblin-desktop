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
      entityId: 'entityId',
    };
  }

  render () {
    const {
      id,
      kind,
      width,
      entityId,
      detailWidget,
      detailWidgetId,
    } = this.props;

    if (!id) {
      return null;
    }
    if (!detailWidget) {
      return null;
    }
    if (!detailWidgetId) {
      return null;
    }

    if (!entityId) {
      return null;
    }

    const workitemUI = uiImporter (detailWidget);
    const DetailUI = this.WithState (workitemUI.panel.readonly, 'entityId') (
      '.entityId'
    );
    const workitemId = detailWidgetId;
    return (
      <Container
        kind={kind ? kind : 'view-right'}
        width={width ? width : '750px'}
      >
        <Workitem
          kind="detail"
          id={workitemId}
          entityId={entityId}
          title={() => {
            return <div>Détails</div>;
          }}
          readonly="true"
        >
          <DetailUI
            id={workitemId}
            theme={this.context.theme}
            entityId={entityId}
          />
        </Workitem>
      </Container>
    );
  }
}

export default Detail;
