import React from 'react';
import Widget from 'laboratory/widget';

import Container from 'gadgets/container/widget';
import DialogModal from 'gadgets/dialog-modal/widget';
import Button from 'gadgets/button/widget';
import DataGridTable from './datagrid-table';
import DataGridEntity from './datagrid-entity';

import importer from 'laboratory/importer/';
const uiImporter = importer('ui');

class DataGrid extends Widget {
  constructor() {
    super(...arguments);
    this.onClose = this.onClose.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      title: 'title',
      dialog: 'dialog',
      columnsSize: 'columnsSize',
    };
  }

  onClose(kind, desktopId, contextId) {
    const service = this.props.id.split('@')[0];
    this.doAs(service, 'close', {kind, desktopId, contextId});
  }

  render() {
    const {id, kind, title, columns} = this.props;
    const self = this;
    if (!id) {
      return null;
    }

    const Table = DataGridTable.connectTo(this);

    const workitem = id.split('@')[0];
    const entityUI = uiImporter(workitem);

    function renderHeader() {}

    function renderTable() {
      return (
        <Table
          renderItem={props => {
            return (
              <Container kind="row-pane" subkind="large-box">
                <DataGridEntity
                  entityUI={entityUI}
                  columnsSize={columnsSize}
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
            {renderHeader()}
            {renderTable()}
            <Button
              key={id}
              text="Close"
              kind="action"
              place={`1/2`}
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
            {renderHeader()}
            {renderTable()}
          </Container>
        );
      }
    }
  }
}

export default DataGrid;
