import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import FacetCheckbox from '../facet-checkbox/widget.js';
import FacetFilterListDialogFooter from '../facet-filter-list-dialog-footer/widget.js';
import * as FacetHelpers from '../helpers/facet-helpers';
import {Unit} from 'goblin-theme';
const px = Unit.toPx;

class FacetFilterListDialog extends Widget {
  constructor() {
    super(...arguments);

    this.changeFacet = this.changeFacet.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  onClose() {
    this.props.onClose();
  }

  changeFacet(facet) {
    return () => {
      this.doAs('list', 'toggle-facet-filter', {
        filterName: this.props.name,
        facet: facet,
      });
    };
  }

  /******************************************************************************/

  renderClose() {
    return null;
    //- return (
    //-   <div className={this.styles.classNames.closeButton}>
    //-     <Button
    //-       border="none"
    //-       glyph="solid/times"
    //-       glyphSize="120%"
    //-       height="32px"
    //-       width="32px"
    //-       onClick={this.onClose}
    //-     />
    //-   </div>
    //- );
  }

  renderFooter() {
    return (
      <FacetFilterListDialogFooter id={this.props.id} name={this.props.name} />
    );
  }

  renderButtons() {
    const result = [];
    const keys = this.getState()
      .backend.get(this.props.id)
      .get('checkboxes')
      .get(this.props.name)
      .keySeq();
    const type = FacetHelpers.getType(keys);

    if (this.props.numberOfCheckboxes < 20) {
      for (const key of keys) {
        result.push(
          <FacetCheckbox
            id={this.props.id}
            key={`${key}-val`}
            name={this.props.name}
            text={FacetHelpers.format(key, type)}
            value={key}
            onChange={this.changeFacet(key)}
          />
        );
      }
    } else {
      let lastTab = null;
      for (const key of keys) {
        const tab = FacetHelpers.extractTab(key, type);
        if (lastTab !== tab.internal) {
          lastTab = tab.internal;
          result.push(
            <div
              key={`${key}-${tab.internal}`}
              className={this.styles.classNames.letter}
            >
              <Label
                fontSize="300%"
                textColor={this.context.theme.palette.mainTabBackground}
                text={tab.displayed}
              />
            </div>
          );
        }
        result.push(
          <FacetCheckbox
            id={this.props.id}
            key={`${key}-val`}
            name={this.props.name}
            text={FacetHelpers.format(key, type)}
            value={key}
            onChange={this.changeFacet(key)}
          />
        );
      }
    }
    return result;
  }

  renderList() {
    return (
      <div className={this.styles.classNames.facetFilterDialog}>
        <div className={this.styles.classNames.buttons}>
          <div className={this.styles.classNames.scrollable}>
            {this.renderButtons()}
          </div>
        </div>
        {this.renderFooter()}
        {this.renderClose()}
      </div>
    );
  }

  render() {
    if (this.props.loading) {
      return null;
    }

    const windowHeight = window.innerHeight;
    const r = this.props.parentButtonRect;
    let centerY = r.top + r.height / 2;
    let shiftY = 0;
    const width = 520;
    const count = this.props.numberOfCheckboxes;
    const height = Math.min(Math.max(count * 20 + 100, 200), windowHeight - 20);

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
        width={px(width)}
        height={px(height)}
        left={px(r.right + 40)}
        center={px(centerY)}
        triangleShift={px(shiftY)}
        backgroundClose={true}
        close={this.onClose}
      >
        {this.renderList()}
      </DialogModal>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state, props) => {
  const flags = state.get(`backend.${props.id}.checkboxes.${props.name}`);
  if (flags) {
    return {numberOfCheckboxes: flags.size};
  } else {
    return {loading: true};
  }
})(FacetFilterListDialog);
