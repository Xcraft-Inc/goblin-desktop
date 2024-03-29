//T:2019-02-27
import T from 't';
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';

import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Button from 'goblin-gadgets/widgets/button/widget';

import importer from 'goblin_importer';
const uiImporter = importer('ui');

class WorkitemDialog extends Widget {
  constructor() {
    super(...arguments);
    this.onClose = this.onClose.bind(this);
    this.onClick = this.onClick.bind(this);
    this.initializeEntity = this.initializeEntity.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      title: 'title',
      dialog: 'dialog',
    };
  }

  /*
  ToDo : why initialize is called in render?
  UNSAFE_componentWillMount () {
    this.initializeEntity ();
  }
  */

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

  render() {
    const {id} = this.props;
    if (!id) {
      return null;
    }

    this.initializeEntity();

    let DialogUI = this.WithState(
      this.entityUI.panel.edit,
      'entityId'
    )('.entityId');

    return (
      <DialogModal
        width={this.props.dialog ? this.props.dialog.get('width') : '1000px'}
        height={this.props.dialog ? this.props.dialog.get('height') : null}
        zIndex={this.props.dialog ? this.props.dialog.get('zIndex') : null}
      >
        <div>
          <DialogUI />
          <Button
            key={id}
            text={T('Fermer')}
            kind="action"
            justify="center"
            place="single"
            onClick={() => this.onClick()}
          />
        </div>
      </DialogModal>
    );
  }
}

export default Widget.Wired(WorkitemDialog);
