import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import TextFieldTypedNC from 'goblin-gadgets/widgets/text-field-typed-nc/widget';
import Slider from 'goblin-gadgets/widgets/slider/widget';
import FacetFilterRangeDialogFooter from '../facet-filter-range-dialog-footer/widget.js';
import {date as DateConverters} from 'xcraft-core-converters';
import {Unit} from 'goblin-theme';
const px = Unit.toPx;

/******************************************************************************/

class FacetFilterRangeDialog extends Widget {
  constructor() {
    super(...arguments);

    this.handleFieldFrom = this.handleFieldFrom.bind(this);
    this.handleFieldTo = this.handleFieldTo.bind(this);
    this.handleSlider = this.handleSlider.bind(this);
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

  handleSlider(value) {
    const a = value.split(';');
    const from = this.sliderToExternal(a[0]);
    const to = this.sliderToExternal(a[1]);

    this.doAs('list', 'set-range', {
      filterName: this.props.name,
      from,
      to,
    });
  }

  /******************************************************************************/

  externalToDisplayed(value) {
    if (this.props.type === 'date') {
      return DateConverters.getDisplayed(value);
    } else {
      return value;
    }
  }

  externalToSlider(value) {
    if (this.props.type === 'date') {
      value = DateConverters.canonicalToJs(value);
      const min = DateConverters.canonicalToJs(this.props.min);
      const days = (value - min) / (1000 * 60 * 60 * 24);
      return Math.round(days);
    } else {
      return value - this.props.min;
    }
  }

  sliderToExternal(n) {
    if (this.props.type === 'date') {
      if (typeof n === 'string') {
        n = parseInt(n);
      }
      const date = DateConverters.canonicalToJs(this.props.min);
      date.setDate(date.getDate() + n);
      return DateConverters.jsToCanonical(date);
    } else {
      return n + this.props.min;
    }
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
        min={this.props.min}
        max={this.props.max}
        from={this.props.from}
        to={this.props.to}
      />
    );
  }

  renderFields(parentRect) {
    return (
      <div className={this.styles.classNames.fields}>
        <TextFieldTypedNC
          parentRect={parentRect}
          type={this.props.type}
          value={this.props.from}
          onChange={this.handleFieldFrom}
        />
        <Label grow="1" />
        <TextFieldTypedNC
          parentRect={parentRect}
          type={this.props.type}
          value={this.props.to}
          onChange={this.handleFieldTo}
        />
      </div>
    );
  }

  renderSliders() {
    const value1 = this.externalToSlider(this.props.from);
    const value2 = this.externalToSlider(this.props.to);
    const value = `${value1};${value2}`;

    return (
      <div className={this.styles.classNames.sliders}>
        <Slider
          grow="1"
          direction="horizontal"
          barColor="#0f0"
          barPosition="middle"
          min={0}
          max={this.externalToSlider(this.props.max)}
          step={1}
          value={value}
          changeMode="throttled"
          throttleDelay={200}
          onChange={this.handleSlider}
        />
      </div>
    );
  }

  renderMinMax() {
    const min = this.externalToDisplayed(this.props.min);
    const max = this.externalToDisplayed(this.props.max);

    return (
      <div className={this.styles.classNames.minmax}>
        <Label fontSize="70%" disabled={true} text={min} />
        <Label grow="1" />
        <Label fontSize="70%" disabled={true} text={max} justify="end" />
      </div>
    );
  }

  // Build UI for range of dates or number.
  renderRange(parentRect) {
    return (
      <div className={this.styles.classNames.facetFilterDialog}>
        <div className={this.styles.classNames.content}>
          {this.renderFields(parentRect)}
          {this.renderSliders()}
          {this.renderMinMax()}
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
    const height = 210;
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
    const min = range.get('min');
    const max = range.get('max');
    const from = range.get('from', min);
    const to = range.get('to', max);

    return {min, max, from, to};
  } else {
    return {loading: true};
  }
})(FacetFilterRangeDialog);
