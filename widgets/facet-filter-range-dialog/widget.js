import React from 'react';
import Widget from 'laboratory/widget';
import T from 't';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import Separator from 'gadgets/separator/widget';
import TextFieldTypedNC from 'gadgets/text-field-typed-nc/widget';
import Slider from 'gadgets/slider/widget';
import FacetFilterRangeDialogFooter from '../facet-filter-range-dialog-footer/widget.js';
import {Unit} from 'goblin-theme';
const px = Unit.toPx;

class FacetFilterRangeDialog extends Widget {
  constructor() {
    super(...arguments);

    this.handleFieldFrom = this.handleFieldFrom.bind(this);
    this.handleFieldTo = this.handleFieldTo.bind(this);
    this.handleSliderFrom = this.handleSliderFrom.bind(this);
    this.handleSliderTo = this.handleSliderTo.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  onClose() {
    this.props.onClose();
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

  renderFooter() {
    return (
      <FacetFilterRangeDialogFooter
        id={this.props.id}
        name={this.props.name}
        type={this.props.type}
      />
    );
  }

  // Build UI for range of dates or number.
  renderRange(parentRect) {
    const fromText = this.props.type === 'date' ? T('Du') : T('De');
    const toText = this.props.type === 'date' ? T('Au') : T('À');

    return (
      <div className={this.styles.classNames.facetFilterDialog}>
        <div className={this.styles.classNames.content}>
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
        {this.renderFooter()}
        {this.renderClose()}
      </div>
    );
  }

  render() {
    if (this.props.loading) {
      return null;
    }

    const r = this.props.parentButtonRect;
    const centerY = r.top + r.height / 2;
    const width = 480;
    const height = 190;
    const shiftY = 0;

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
        {this.renderRange(parentRect)}
      </DialogModal>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state, props) => {
  const range = state.get(`backend.${props.id}.ranges.${props.name}`);
  if (range) {
    return {
      from: range.get('from', range.get('min')),
      to: range.get('to', range.get('max')),
    };
  } else {
    return {loading: true};
  }
})(FacetFilterRangeDialog);
