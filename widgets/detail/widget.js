//T:2019-02-27

import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import importer from 'goblin_importer';

import Container from 'goblin-gadgets/widgets/container/widget';
import Workitem from 'goblin-desktop/widgets/workitem/widget';

const Spinner = () => {
  return <Container width={'100%'} height={'100%'} busy={true} />;
};
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
    return (
      <Container
        kind="view-right"
        grow="1"
        width={width ? width : '800px'}
        busy={this.props.loading}
      >
        <Detail
          kind={kind ? kind : 'detail'}
          id={workitemId}
          entityId={entityId}
          readonly={true}
          dragServiceId={this.props.dragServiceId}
          leftPanelWorkitemId={this.props.leftPanelWorkitemId}
        >
          {this.buildLoader(
            entityId,
            () => {
              let DetailUI = this.WithState(
                workitemUI.panel.readonly,
                'entityId'
              )('.entityId');

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
                <DetailUI
                  id={workitemId}
                  theme={this.context.theme}
                  do={this.doProxy}
                  entityId={entityId}
                  entitySchema={this.getSchema(this.props.type)}
                  contextId={this.context.contextId}
                />
              );
            },
            Spinner
          )}
        </Detail>
      </Container>
    );
  }
}

export default Widget.Wired(Detail)();
