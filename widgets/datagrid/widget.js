//T:2019-02-27

import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';

import throttle from 'lodash/throttle';
import Container from 'goblin-gadgets/widgets/container/widget';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import List from 'goblin-gadgets/widgets/list/widget';
import DatagridEntity from './datagrid-entity.js';
import DatagridHeaders from './datagrid-headers.js';
import DatagridItem from 'goblin-desktop/widgets/datagrid-item/widget';

import importer from 'goblin_importer';
const uiImporter = importer('ui');

class Datagrid extends Widget {
  constructor() {
    super(...arguments);

    this.onClick = this.onClick.bind(this);
    this.onClose = this.onClose.bind(this);

    this.initializeEntity = this.initializeEntity.bind(this);
    this.mapItem = this.mapItem.bind(this);
    this.renderHeaders = this.renderHeaders.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.renderListItem = this.renderListItem.bind(this);
    this.renderDatagridItem = this.renderDatagridItem.bind(this);

    this._entityIds = [];
    this._drillDownInternal = this._drillDownInternal.bind(this);
    this._drillDown = throttle(this._drillDownInternal, 100).bind(this);
    this.drillDown = this.drillDown.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      title: 'title',
      dialog: 'dialog',
      columnsNo: 'columnsNo',
    };
  }

  _drillDownInternal() {
    const service = this.props.id.split('@')[0];
    this.doAs(service, 'drill-down', {
      entityIds: this._entityIds,
    });
    this._entityIds = [];
  }

  drillDown(entityId) {
    this._entityIds.push(entityId);
    this._drillDown();
  }

  onClose(kind, desktopId, contextId) {
    const service = this.props.id.split('@')[0];
    this.doAs(service, 'close', {kind, desktopId, contextId});
  }

  onClick() {
    this.onClose(this.props.kind, this.desktopId, this.contextId);
  }

  initializeEntity() {
    const {id} = this.props;

    const workitem = id.split('@')[0];
    this.entityUI = uiImporter(workitem);
  }

  mapItem(entity) {
    return {id: entity.get('id')};
  }

  renderListItem(props) {
    return (
      <DatagridItem
        height={props.height ?? 40}
        renderItem={this.renderDatagridItem}
        onDrillDown={this.drillDown}
        {...props}
      />
    );
  }

  renderDatagridItem(props) {
    const {columnsNo} = this.props;
    return (
      <DatagridEntity
        entityUI={this.entityUI}
        columnsNo={columnsNo}
        datagridId={this.props.id}
        className={this.styles.classNames.entity}
        {...props}
      />
    );
  }

  renderHeaders() {
    const {columnsNo} = this.props;

    const Headers = DatagridHeaders.connectTo(this);

    return (
      <Headers
        entityUI={this.entityUI}
        columnsNo={columnsNo}
        datagridId={this.props.id}
      />
    );
  }

  renderTable() {
    setTimeout(this._fetch, 0);

    const {id, ...others} = this.props;
    const listId = `list@${id}`;

    return (
      <Container kind="panes">
        <List
          id={listId}
          type={'uniform'}
          renderItem={this.renderListItem}
          mapItem={this.mapItem}
          {...others}
        />
      </Container>
    );
  }

  render() {
    const {id, kind} = this.props;
    if (!id) {
      return null;
    }

    this.initializeEntity();

    switch (kind) {
      case 'dialog': {
        return (
          <DialogModal
            width={
              this.props.dialog
                ? this.props.dialog.get('width') || '1000px'
                : '1000px'
            }
            height={this.props.dialog ? this.props.dialog.get('height') : null}
            zIndex={this.props.dialog ? this.props.dialog.get('zIndex') : null}
          >
            {this.renderHeaders()}
            {this.renderTable()}
            <Button
              key={id}
              text={T('Close')}
              kind="action"
              justify="center"
              place="single"
              onClick={this.onClick}
            />
          </DialogModal>
        );
      }

      default: {
        return (
          <Container
            kind="view"
            width={
              this.props.dialog
                ? this.props.dialog.get('width') || '100%'
                : '100%'
            }
            horizontalSpacing="large"
          >
            {this.renderHeaders()}
            {this.renderTable()}
          </Container>
        );
      }
    }
  }
}

export default Widget.Wired(Datagrid)();
