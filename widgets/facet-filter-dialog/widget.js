import React from 'react';
import Widget from 'laboratory/widget';
import T from 't';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import Separator from 'gadgets/separator/widget';
import TextFieldTypedNC from 'gadgets/text-field-typed-nc/widget';
import Slider from 'gadgets/slider/widget';
import FacetCheckbox from '../facet-checkbox/widget.js';
import FacetFilterDialogFooter from '../facet-filter-dialog-footer/widget.js';
import * as FacetHelpers from '../helpers/facet-helpers';
import {Unit} from 'goblin-theme';
const px = Unit.toPx;

class FacetFilterDialog extends Widget {
  constructor() {
    super(...arguments);

    this.changeFacet = this.changeFacet.bind(this);
    this.handleFieldFrom = this.handleFieldFrom.bind(this);
    this.handleFieldTo = this.handleFieldTo.bind(this);
    this.handleSliderFrom = this.handleSliderFrom.bind(this);
    this.handleSliderTo = this.handleSliderTo.bind(this);
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

  handleFieldFrom(value) {
    this.doAs('list', 'set-range', {
      filterName: this.props.name,
      from: value,
      to: this.props.to,
    });
  }

  handleFieldTo(value) {
    this.doAs('list', 'set-range', {
      filterName: this.props.name,
      from: this.props.from,
      to: value,
    });
  }

  handleSliderFrom(value) {
    //
  }

  handleSliderTo(value) {
    //
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

  renderFooter(hasCheckbox) {
    return (
      <FacetFilterDialogFooter
        id={this.props.id}
        name={this.props.name}
        hasCheckbox={hasCheckbox}
      />
    );
  }

  // Build UI for range of dates or number.
  renderRange(parentRect) {
    const fromText = this.props.type === 'date' ? T('Du') : T('De');
    const toText = this.props.type === 'date' ? T('Au') : T('À');

    return (
      <div className={this.styles.classNames.facetFilterDialog}>
        <div className={this.styles.classNames.buttons}>
          <Container kind="row" subkind="center">
            <Label width="50px" text={fromText} />
            <TextFieldTypedNC
              parentRect={parentRect}
              horizontalSpacing="large"
              type={this.props.type}
              value={this.props.from}
              onChange={this.handleFieldFrom}
            />
            <Slider
              width="200px"
              direction="horizontal"
              colorBar="#f00"
              min={0}
              max={100}
              step={1}
              value={20}
              changeMode="throttled"
              throttleDelay={50}
              onChange={this.handleSliderFrom}
            />
          </Container>

          <Separator kind="exact" height="5px" />

          <Container kind="row" subkind="center">
            <Label width="50px" text={toText} />
            <TextFieldTypedNC
              parentRect={parentRect}
              horizontalSpacing="large"
              type={this.props.type}
              value={this.props.to}
              onChange={this.handleFieldTo}
            />
            <Slider
              width="200px"
              direction="horizontal"
              colorBar="#0f0"
              min={0}
              max={100}
              step={1}
              value={80}
              changeMode="throttled"
              throttleDelay={50}
              onChange={this.handleSliderTo}
            />
          </Container>
        </div>
        {this.renderFooter(false)}
        {this.renderClose()}
      </div>
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
        {this.renderFooter(true)}
        {this.renderClose()}
      </div>
    );
  }

  renderContent(parentRect) {
    if (FacetHelpers.isRange(this.props.type)) {
      return this.renderRange(parentRect);
    } else {
      return this.renderList();
    }
  }

  render() {
    if (this.props.loading) {
      return null;
    }

    const windowHeight = window.innerHeight;
    const r = this.props.parentButtonRect;
    let centerY = r.top + r.height / 2;

    let width,
      height,
      shiftY = 0;

    if (FacetHelpers.isRange(this.props.type)) {
      width = 480;
      height = 190;
    } else {
      width = 520;

      const count = this.props.numberOfCheckboxes;
      height = Math.min(Math.max(count * 20 + 100, 200), windowHeight - 20);

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
    }

    const parentRect = {
      left: r.right + 40,
      right: r.right + 40 + width,
      top: centerY - height / 2,
      bottom: centerY + height / 2,
    };

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
        {this.renderContent(parentRect)}
      </DialogModal>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state, props) => {
  if (FacetHelpers.isRange(props.type)) {
    const range = state.get(`backend.${props.id}.ranges.${props.name}`);
    if (range) {
      return {
        from: range.get('from', range.get('min')),
        to: range.get('to', range.get('max')),
      };
    } else {
      return {loading: true};
    }
  } else {
    const flags = state.get(`backend.${props.id}.checkboxes.${props.name}`);
    if (flags) {
      return {numberOfCheckboxes: flags.size};
    } else {
      return {loading: true};
    }
  }
})(FacetFilterDialog);
