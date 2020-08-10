import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import TextFieldTypedNC from 'goblin-gadgets/widgets/text-field-typed-nc/widget';
import Slider from 'goblin-gadgets/widgets/slider/widget';
import CheckList from 'goblin-gadgets/widgets/check-list/widget';
import FacetFilterRangeDialogFooter from '../facet-filter-range-dialog-footer/widget.js';
import Junction from '../junction/widget.js';
import {date as DateConverters} from 'xcraft-core-converters';
import T from 't';
import {Unit} from 'goblin-theme';
const px = Unit.toPx;

/******************************************************************************/

class FacetFilterRangeDialog extends Widget {
  constructor() {
    super(...arguments);

    this.handleChangeUseRange = this.handleChangeUseRange.bind(this);
    this.handleFieldFrom = this.handleFieldFrom.bind(this);
    this.handleFieldTo = this.handleFieldTo.bind(this);
    this.handleSlider = this.handleSlider.bind(this);
    this.onClose = this.onClose.bind(this);

    this.state = {
      useRange: true, // mock
    };

    this.width = 480;
    this.sliderThickness = 24; // according to lib\goblin-gadgets\widgets\slider\styles.js
  }

  //#region get/set
  get useRange() {
    return this.state.useRange;
  }
  set useRange(value) {
    this.setState({
      useRange: value,
    });
  }
  //#endregion

  onClose() {
    this.props.onClose();
  }

  handleChangeUseRange(value) {
    this.useRange = value === 'range'; // mock
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

  renderRadios() {
    const list = [
      {name: 'all', description: T('Tout')},
      {name: 'range', description: T('Intervalle')},
    ];

    return (
      <div className={this.styles.classNames.radios}>
        <div className={this.styles.classNames.checkList}>
          <CheckList
            kind="radio"
            direction="row"
            selectionMode="single"
            list={list}
            value={this.useRange ? 'range' : 'all'}
            selectionChanged={this.handleChangeUseRange}
          />
        </div>
      </div>
    );
  }

  renderFields(parentRect) {
    if (!this.useRange) {
      return null;
    }

    let minDate, maxDate, min, max;

    if (this.props.type === 'date') {
      minDate = this.props.min;
      maxDate = this.props.max;
    } else {
      min = this.props.min;
      max = this.props.max;
    }

    return (
      <div className={this.styles.classNames.fields}>
        <TextFieldTypedNC
          parentRect={parentRect}
          type={this.props.type}
          minDate={minDate}
          maxDate={maxDate}
          min={min}
          max={max}
          mode="hard"
          value={this.props.from}
          onChange={this.handleFieldFrom}
        />
        <Label grow="1" />
        <TextFieldTypedNC
          parentRect={parentRect}
          type={this.props.type}
          minDate={minDate}
          maxDate={maxDate}
          min={min}
          max={max}
          mode="hard"
          value={this.props.to}
          onChange={this.handleFieldTo}
        />
      </div>
    );
  }

  renderJunction() {
    if (!this.useRange) {
      return null;
    }

    const min = this.externalToSlider(this.props.min);
    const max = this.externalToSlider(this.props.max);
    const from = Math.max(this.externalToSlider(this.props.from), min);
    const to = Math.min(this.externalToSlider(this.props.to), max);

    const w = this.width - 30 * 2;

    const fieldWidth = 150;
    let x1From = fieldWidth / 2;
    let x1To = w - fieldWidth / 2;

    const sliderWidth = w - this.sliderThickness;
    const x2From =
      this.sliderThickness / 2 + ((from - min) / (max - min)) * sliderWidth;
    const x2To =
      this.sliderThickness / 2 + ((to - min) / (max - min)) * sliderWidth;

    if (x2From > x1From - 20 && x2From < x1From + 20) {
      x1From = x2From;
    }
    if (x2To > x1To - 20 && x2To < x1To + 20) {
      x1To = x2To;
    }

    const h = 30;
    const shift = 3;
    let yFrom, yTo;
    if (x2To < x1From + shift && x2From !== x2To) {
      yFrom = h / 2 - shift;
      yTo = h / 2 + shift;
    } else if (x2From > x1To - shift && x2From !== x2To) {
      yFrom = h / 2 + shift;
      yTo = h / 2 - shift;
    } else {
      yFrom = h / 2;
      yTo = h / 2;
    }

    const color = this.context.theme.palette.buttonBorder;

    return (
      <div className={this.styles.classNames.junctions}>
        <Junction color={color} w={w} h={h} y={yFrom} x1={x1From} x2={x2From} />
        <Junction color={color} w={w} h={h} y={yTo} x1={x1To} x2={x2To} />
      </div>
    );
  }

  renderSliders() {
    if (!this.useRange) {
      return null;
    }

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
    if (!this.useRange) {
      return null;
    }

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
        useRange={this.useRange}
      />
    );
  }

  // Build UI for range of dates or number.
  renderRange(parentRect) {
    return (
      <div className={this.styles.classNames.facetFilterDialog}>
        {this.renderRadios()}
        <div className={this.styles.classNames.content}>
          {this.renderFields(parentRect)}
          {this.renderJunction()}
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
    const width = this.width;
    const height = 280;
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
