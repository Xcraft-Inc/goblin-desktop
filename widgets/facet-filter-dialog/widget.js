import React from 'react';
import Widget from 'laboratory/widget';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Label from 'gadgets/label/widget';
import FacetCheckbox from '../facet-checkbox/widget.js';
import FacetFilterDialogFooter from '../facet-filter-dialog-footer/widget.js';
import * as FacetHelpers from '../helpers/facet-helpers';

/******************************************************************************/

class FacetFilterDialog extends Widget {
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
        facet: facet,
        filterName: this.props.name,
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

  renderButtons(keys) {
    const result = [];
    const type = FacetHelpers.getType(keys);
    if (this.props.numberOfCheckboxes < 20) {
      for (const key of keys) {
        result.push(
          <FacetCheckbox
            id={this.props.id}
            key={`${key}-val`}
            name={this.props.name}
            text={FacetHelpers.format(key, type)}
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

  renderFooter() {
    return (
      <FacetFilterDialogFooter id={this.props.id} name={this.props.name} />
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

    const keys = this.getState()
      .backend.get(this.props.id)
      .get('checkboxes')
      .get(this.props.name)
      .keys();

    return (
      <DialogModal
        width="520px"
        height={height + 'px'}
        left={r.right + 40 + 'px'}
        center={centerY + 'px'}
        triangleShift={shiftY + 'px'}
        backgroundClose={true}
        close={this.onClose}
      >
        <div className={this.styles.classNames.facetFilterDialog}>
          <div className={this.styles.classNames.buttons}>
            <div className={this.styles.classNames.scrollable}>
              {this.renderButtons(keys)}
            </div>
          </div>
          {this.renderFooter()}
          {this.renderClose()}
        </div>
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
})(FacetFilterDialog);
