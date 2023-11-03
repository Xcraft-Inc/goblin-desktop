//T:2019-02-27

import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import StateLoader from 'goblin-laboratory/widgets/state-loader/widget.js';
import stateMapperToProps from 'goblin-laboratory/widgets/state-mapper-to-props/widget.js';
import importer from 'goblin_importer';

import Container from 'goblin-gadgets/widgets/container/widget';
import Workitem from 'goblin-desktop/widgets/workitem/widget';

const Spinner = () => {
  return <Container width={'100%'} height={'100%'} busy={true} />;
};
const uiImporter = importer('ui');

const WorkitemConnected = Widget.connectBackend((state, props) => {
  return {buttons: state.get('buttons')};
})(Workitem);

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
    const mapper =
      workitemUI.mappers &&
      workitemUI.mappers.panel &&
      workitemUI.mappers.panel.readonly;
    const DetailUI = stateMapperToProps(
      workitemUI.panel.readonly,
      mapper,
      `backend.${entityId}`
    );

    return (
      <Container
        kind="view-right"
        grow="1"
        width={width ? width : '800px'}
        busy={this.props.loading}
      >
        <WorkitemConnected
          kind={kind ? kind : 'detail'}
          id={workitemId}
          entityId={entityId}
          readonly={true}
          dragServiceId={this.props.dragServiceId}
          leftPanelWorkitemId={this.props.leftPanelWorkitemId}
        >
          <StateLoader path={entityId} FallbackComponent={Spinner}>
            <DetailUI
              id={workitemId}
              theme={this.context.theme}
              do={this.doProxy}
              entityId={entityId}
              entitySchema={this.getSchema(this.props.type)}
              contextId={this.context.contextId}
            />
          </StateLoader>
        </WorkitemConnected>
      </Container>
    );
  }
}

export default Widget.Wired(Detail);
