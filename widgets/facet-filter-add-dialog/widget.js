import React from 'react';
import Widget from 'laboratory/widget';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Label from 'gadgets/label/widget';
import Button from 'gadgets/button/widget';
import T from 't';

/******************************************************************************/

export default class FacetFilterAddDialog extends Widget {
  constructor() {
    super(...arguments);

    this.onAdd = this.onAdd.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  onAdd() {
    // TODO
    this.props.onClose();
  }

  onClose() {
    this.props.onClose();
  }

  /******************************************************************************/

  renderHeader() {
    return (
      <div className={this.styles.classNames.header}>
        <Label
          kind="title"
          textColor={this.context.theme.palette.stateBrowserBackText}
          text={T('Ajouter un nouveau filtre')}
        />
      </div>
    );
  }

  renderContent() {
    return (
      <div className={this.styles.classNames.content}>
        <Label text="TODO: Montrer ici la liste des champs..." />
      </div>
    );
  }

  renderFooter() {
    return (
      <div className={this.styles.classNames.footer}>
        <Button
          kind="action"
          place="1/2"
          width="160px"
          glyph="solid/plus"
          text={T('Ajouter')}
          onClick={this.onAdd}
        />
        <Button
          kind="action"
          place="2/2"
          width="160px"
          glyph="solid/times"
          text={T('Fermer')}
          onClick={this.onClose}
        />
      </div>
    );
  }

  render() {
    if (this.props.loading) {
      return null;
    }
    const windowHeight = window.innerHeight;
    const r = this.props.parentButtonRect;
    const count = this.props.numberOfCheckboxes;
    const height = Math.min(Math.max(count * 20 + 100, 200), windowHeight - 20);
    let centerY = r.top + r.height / 2;

    let shiftY = 0;
    if (centerY - height / 2 < 10) {
      const offset = height / 2 - centerY + 10;
      centerY += offset;
      shiftY = -offset;
    }
    if (centerY + height / 2 > windowHeight - 10) {
      const offset = centerY + height / 2 - (windowHeight - 10);
      centerY -= offset;
      shiftY = offset;
    }

    return (
      <DialogModal
        width="520px"
        height="600px"
        left={r.right + 40 + 'px'}
        center={centerY + 'px'}
        triangleShift={shiftY + 'px'}
        backgroundClose={true}
        close={this.onClose}
      >
        <div className={this.styles.classNames.facetFilterDialogAdd}>
          {this.renderHeader()}
          {this.renderContent()}
          {this.renderFooter()}
        </div>
      </DialogModal>
    );
  }
}

/******************************************************************************/
