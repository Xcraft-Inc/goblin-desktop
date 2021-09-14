import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import TextFieldNC from 'goblin-gadgets/widgets/text-field-nc/widget';
import FacetCheckbox from '../facet-checkbox/widget.js';
import FacetFilterListDialogFooter from '../facet-filter-list-dialog-footer/widget.js';
import FacetHelpers from '../helpers/facet-helpers';
import {Unit} from 'goblin-theme';
import T from 't';
const px = Unit.toPx;

class FacetFilterListDialog extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      filter: null,
    };

    this.changeFacet = this.changeFacet.bind(this);
    this.filterChange = this.filterChange.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  //#region get/set
  get filter() {
    return this.state.filter;
  }
  set filter(value) {
    this.setState({
      filter: value,
    });
  }
  //#endregion

  getFilteredKeys(filter) {
    const keys = this.getState()
      .backend.get(this.props.id)
      .get('checkboxes')
      .get(this.props.name)
      .keySeq();
    const type = FacetHelpers.getType(keys);
    filter = FacetHelpers.preprocessFilter(filter);

    return keys.filter((key) => {
      const text = FacetHelpers.format(key, type);
      return FacetHelpers.match(text, filter);
    });
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

  initAllFacets(keys) {
    this.doAs('list', 'init-all-facets', {
      filterName: this.props.name,
      keys,
    });
  }

  filterChange(text) {
    this.filter = text;

    const keys = this.getFilteredKeys(text);
    this.initAllFacets(keys);
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

  renderHeader(keys) {
    if (this.props.numberOfCheckboxes <= 5) {
      return null;
    }

    return (
      <div className={this.styles.classNames.header}>
        <Label text={T('Filtre')} />
        <TextFieldNC
          width="300px"
          shape={this.filter ? 'left-rounded' : 'rounded'}
          value={this.filter}
          changeMode="throttled"
          throttleDelay={200}
          onChange={this.filterChange}
        />
        <Button
          kind="combo"
          shape="right-rounded"
          leftSpacing="overlap"
          glyph="solid/eraser"
          tooltip={T('Tout montrer')}
          show={!!this.filter}
          onClick={() => this.filterChange(null)}
        />
      </div>
    );
  }

  renderFooter(keys) {
    return (
      <FacetFilterListDialogFooter
        id={this.props.id}
        name={this.props.name}
        keys={keys}
      />
    );
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
            text={FacetHelpers.format(key, type, this.props.propInfos)}
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
            text={FacetHelpers.format(key, type, this.props.propInfos)}
            value={key}
            onChange={this.changeFacet(key)}
          />
        );
      }
    }
    return result;
  }

  renderList() {
    const keys = this.getFilteredKeys(this.filter);

    return (
      <div className={this.styles.classNames.facetFilterDialog}>
        {this.renderHeader(keys)}
        <div className={this.styles.classNames.buttons}>
          <div className={this.styles.classNames.scrollable}>
            {this.renderButtons(keys)}
          </div>
        </div>
        {this.renderFooter(keys)}
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
