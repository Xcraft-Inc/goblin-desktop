import React from 'react';
import Widget from 'laboratory/widget';
import importer from 'laboratory/importer/';

import Container from 'gadgets/container/widget';
import Workitem from 'desktop/workitem/widget';

const uiImporter = importer('ui');

class Detail extends Widget {
  constructor() {
    super(...arguments);
    this.doProxy = this.doProxy.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      type: 'type',
      title: 'title',
      kind: 'kind',
      width: 'width',
      detailWidget: 'detailWidget',
      detailWidgetId: 'detailWidgetId',
      entityId: 'entityId',
      loading: 'loading',
    };
  }

  doProxy(action, args) {
    const workitem = this.props.detailWidgetId;
    this.doFor(workitem, action, args);
  }

  render() {
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

    const workitemUI = uiImporter(detailWidget);

    const workitemId = detailWidgetId;

    const Detail = this.mapWidget(
      Workitem,
      'buttons',
      `backend.${workitemId}.buttons`
    );

    const DetailWithStatus = this.mapWidget(
      Detail,
      'status',
      `backend.${entityId}.meta.status`
    );

    return this.buildLoader(entityId, () => {
      let DetailUI = this.WithState(workitemUI.panel.readonly, 'entityId')(
        '.entityId'
      );

      if (
        workitemUI.mappers &&
        workitemUI.mappers.panel &&
        workitemUI.mappers.panel.readonly
      ) {
        DetailUI = this.mapWidget(
          DetailUI,
          workitemUI.mappers.panel.readonly,
          `backend.${entityId}`
        );
      }
      return (
        <Container
          kind={kind ? kind : 'view-right'}
          width={width ? width : '700px'}
          busy={this.props.loading}
        >
          <DetailWithStatus
            kind="detail"
            id={workitemId}
            entityId={entityId}
            title={() => {
              return <div>Détails</div>;
            }}
            readonly="true"
            dragServiceId={this.props.dragServiceId}
          >
            <DetailUI
              id={workitemId}
              theme={this.context.theme}
              do={this.doProxy}
              entityId={entityId}
              contextId={this.context.contextId}
            />
          </DetailWithStatus>
        </Container>
      );
    });
  }
}

export default Widget.Wired(Detail)();
