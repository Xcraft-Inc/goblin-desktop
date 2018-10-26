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
    };
  }

  onClose(kind, desktopId, contextId) {
    const service = this.props.id.split('@')[0];
    this.doAs(service, 'close', {kind, desktopId, contextId});
  }

  render() {
    const {id, title, kind} = this.props;
    const self = this;
    if (!id) {
      return null;
    }

    const Table = DataGridTable.connectTo(this);

    const workitem = id.split('@')[0];
    const entityUI = uiImporter(workitem);

    function renderTable() {
      return (
        <Table
          renderItem={props => {
            return (
              <Container kind="row-pane" subkind="large-box">
                <DataGridEntity customUI={entityUI} {...props} />
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
            width={this.props.dialog.get('width')}
            height={this.props.dialog.get('height')}
            zIndex={this.props.dialog.get('zIndex')}
            onBackgroundClick={this.onBackgroundClick}
          >
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
            width={this.props.dialog.get('containerWidth') || '800px'}
            spacing="large"
          >
            {renderTable()}
          </Container>
        );
      }
    }
  }
}

export default DataGrid;
