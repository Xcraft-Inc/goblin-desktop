import React from 'react';
import Form from 'laboratory/form';

import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import DialogModal from 'gadgets/dialog-modal/widget';
import Button from 'gadgets/button/widget';
import List from 'gadgets/list/widget';

class DataGrid extends Form {
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

    const Form = this.Form;
    const DocumentsList = List.connectTo(this);

    const Count = this.mapWidgetToFormPlugin(
      p => (
        <Container busy={p.count === undefined}>{p.count} documents</Container>
      ),
      'count',
      'list',
      '.count'
    );

    function renderList() {
      return (
        <Form {...self.formConfig}>
          <DocumentsList
            renderItem={props => {
              return (
                <Container kind="row-pane" subkind="large-box">
                  <Button
                    kind="container"
                    width="100%"
                    onClick={() => self.navToDetail(self.props.id, props.id)}
                    onDoubleClick={() => {}}
                  >
                    <Label
                      text={props.text}
                      kind="large-single"
                      justify="left"
                      grow="1"
                      wrap="no"
                    />
                  </Button>
                </Container>
              );
            }}
            mapItem={entity => {
              const text = entity.get('value');
              return {text, id: entity.get('id')};
            }}
          />{' '}
        </Form>
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
            {renderList()}
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
            {renderList()}
          </Container>
        );
      }
    }
  }
}

export default DataGrid;
