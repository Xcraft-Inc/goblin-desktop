//T:2019-02-27

import React from 'react';
import Widget from 'laboratory/widget';
import T from 't';

import throttle from 'lodash/throttle';
import Container from 'gadgets/container/widget';
import DialogModal from 'gadgets/dialog-modal/widget';
import Button from 'gadgets/button/widget';
import List from 'gadgets/list/widget';
import DatagridEntity from './datagrid-entity.js';
import DatagridHeaders from './datagrid-headers.js';
import DatagridItem from './datagrid-item.js';

import importer from 'laboratory/importer';
const uiImporter = importer('ui');

class Datagrid extends Widget {
  constructor() {
    super(...arguments);

    this.onClick = this.onClick.bind(this);
    this.onClose = this.onClose.bind(this);

    this.initializeEntity = this.initializeEntity.bind(this);
    this.renderHeaders = this.renderHeaders.bind(this);
    this.renderTable = this.renderTable.bind(this);

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

  renderHeaders() {
    const {columnsNo} = this.props;

    const Headers = DatagridHeaders.connectTo(this);

    return (
      <Headers
        entityUI={this.entityUI}
        columnsNo={columnsNo}
        datagridId={this.props.id}
        className={this.styles.classNames.entity}
      />
    );
  }

  renderTable() {
    setTimeout(this._fetch, 0);

    const {id, columnsNo, ...others} = this.props;
    const listId = `list@${id}`;

    return (
      <Container kind="panes">
        <List
          id={listId}
          type={'uniform'}
          renderItem={props => {
            return (
              <DatagridItem
                renderItem={props => {
                  return (
                    <DatagridEntity
                      entityUI={this.entityUI}
                      columnsNo={columnsNo}
                      datagridId={this.props.id}
                      className={this.styles.classNames.entity}
                      {...props}
                    />
                  );
                }}
                onDrillDown={this.drillDown}
                {...props}
              />
            );
          }}
          mapItem={entity => ({id: entity.get('id')})}
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
            onBackgroundClick={this.onBackgroundClick}
          >
            {this.renderHeaders()}
            {this.renderTable()}
            <Button
              key={id}
              text={T('Close')}
              kind="action"
              justify="center"
              place="single"
              onClick={() => this.onClick()}
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
            spacing="large"
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
