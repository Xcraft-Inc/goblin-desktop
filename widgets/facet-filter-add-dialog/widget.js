import React from 'react';
import Widget from 'laboratory/widget';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Label from 'gadgets/label/widget';
import Button from 'gadgets/button/widget';
import T from 't';
import TT from 'nabu/t/widget';
import withC from 'goblin-laboratory/widgets/connect-helpers/with-c';

/******************************************************************************/

class FacetFilterAddDialog extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      selectedFieldName: null,
    };

    this.onAdd = this.onAdd.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onClickItem = this.onClickItem.bind(this);
  }

  //#region get/set
  get selectedFieldName() {
    return this.state.selectedFieldName;
  }

  set selectedFieldName(value) {
    this.setState({
      selectedFieldName: value,
    });
  }
  //#endregion

  onAdd() {
    // TODO
    this.props.onClose();
  }

  onClose() {
    this.props.onClose();
  }

  onClickItem(fieldName) {
    this.selectedFieldName = fieldName;
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

  renderItem(fieldName, fieldType) {
    const style =
      fieldName === this.selectedFieldName
        ? this.styles.classNames.itemSelected
        : this.styles.classNames.item;

    return (
      <div
        key={fieldName}
        className={style}
        onClick={() => this.onClickItem(fieldName)}
      >
        <TT msgid={fieldName} className={this.styles.classNames.itemName} />
        <TT msgid={fieldType} className={this.styles.classNames.itemType} />
      </div>
    );
  }

  renderItems() {
    if (!this.props.state) {
      return null;
    }

    const items = [];
    for (let [key, value] of this.props.state.get('')) {
      if (typeof value === 'string') {
        const p = value.split('@');
        if (p.length > 1) {
          value = p[1];
        }
      }

      if (typeof value === 'string') {
        items.push(this.renderItem(key, value));
      }
    }
    return items;
  }

  renderContent() {
    return (
      <div className={this.styles.classNames.content}>{this.renderItems()}</div>
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
          disabled={!this.selectedFieldName}
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

export default withC(FacetFilterAddDialog);
