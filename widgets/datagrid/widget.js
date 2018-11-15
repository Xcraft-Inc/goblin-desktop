import React from 'react';
import Widget from 'laboratory/widget';

import Container from 'gadgets/container/widget';
import DialogModal from 'gadgets/dialog-modal/widget';
import Button from 'gadgets/button/widget';
import DatagridTable from './datagrid-table';
import DatagridEntity from './datagrid-entity';
import DatagridHeaders from './datagrid-headers';

import importer from 'laboratory/importer/';
const uiImporter = importer('ui');

class Datagrid extends Widget {
  constructor() {
    super(...arguments);
    this.onClose = this.onClose.bind(this);
    this.scrollTo = this.scrollTo.bind(this);
    this.scrollAround = this.scrollAround.bind(this);
    this.getVisibleRange = this.getVisibleRange.bind(this);

    this.onClick = this.onClick.bind(this);
    this.initializeEntity = this.initializeEntity.bind(this);
    this.renderHeaders = this.renderHeaders.bind(this);
    this.renderTable = this.renderTable.bind(this);

    let entityUI = null;
  }

  static get wiring() {
    return {
      id: 'id',
      title: 'title',
      dialog: 'dialog',
      columnsNo: 'columnsNo',
    };
  }

  onClose(kind, desktopId, contextId) {
    const service = this.props.id.split('@')[0];
    this.doAs(service, 'close', {kind, desktopId, contextId});
  }

  onClick() {
    this.onClose(this.props.kind, this.desktopId, this.contextId);
  }

  scrollTo(index) {
    if (this.list && this.list.scrollTo) {
      this.list.scrollTo(index);
    }
  }
  scrollAround(index) {
    if (this.list && this.list.scrollAround) {
      this.list.scrollAround(index);
    }
  }
  getVisibleRange() {
    if (this.list && this.list.getVisibleRange) {
      return this.list.getVisibleRange();
    }
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
        datagrid={this}
        className={this.styles.classNames.entity}
      />
    );
  }

  renderTable() {
    const {columnsNo} = this.props;

    const Table = DatagridTable.connectTo(this);

    return (
      <Table
        onRef={list => {
          this.list = list;
        }}
        renderItem={props => {
          return (
            <Container kind="row-pane" subkind="large-box">
              <DatagridEntity
                entityUI={this.entityUI}
                columnsNo={columnsNo}
                datagrid={this}
                className={this.styles.classNames.entity}
                {...props}
              />
            </Container>
          );
        }}
        mapItem={entity => ({id: entity.get('id')})}
      />
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
              this.props.dialog ? this.props.dialog.get('width') : '1000px'
            }
            height={this.props.dialog ? this.props.dialog.get('height') : null}
            zIndex={this.props.dialog ? this.props.dialog.get('zIndex') : null}
            onBackgroundClick={this.onBackgroundClick}
          >
            {this.renderHeaders()}
            {this.renderTable()}
            <Button
              key={id}
              text="Close"
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
                ? this.props.dialog.get('width') || '800px'
                : '800px'
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
