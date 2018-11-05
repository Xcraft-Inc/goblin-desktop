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

  render() {
    const {id, kind, title, columnsNo} = this.props;
    const self = this;
    if (!id) {
      return null;
    }

    const Table = DatagridTable.connectTo(this);
    const Headers = DatagridHeaders.connectTo(this);

    const workitem = id.split('@')[0];
    const entityUI = uiImporter(workitem);

    function renderHeaders() {
      return (
        <Headers entityUI={entityUI} columnsNo={columnsNo} datagrid={self} />
      );
    }

    function renderTable() {
      return (
        <Table
          onRef={list => {
            self.list = list;
          }}
          className={self.styles.classNames.item}
          renderItem={props => {
            return (
              <Container kind="row-pane" subkind="large-box">
                <DatagridEntity
                  entityUI={entityUI}
                  columnsNo={columnsNo}
                  datagrid={self}
                  {...props}
                />
              </Container>
            );
          }}
          mapItem={entity => ({id: entity.get('id')})}
        />
      );
    }

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
            {renderHeaders()}
            {renderTable()}
            <Button
              key={id}
              text="Close"
              kind="action"
              justify="center"
              place="single"
              onClick={() => self.onClose(kind, self.desktopId, self.contextId)}
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
            {renderHeaders()}
            {renderTable()}
          </Container>
        );
      }
    }
  }
}

export default Widget.Wired(Datagrid)();
