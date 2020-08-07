import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import T from 't';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Container from 'goblin-gadgets/widgets/container/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Separator from 'goblin-gadgets/widgets/separator/widget';
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
    const from = this.sliderToExternal(value);
    const to = this.sliderToExternal(
      Math.max(this.externalToSlider(this.props.to), value)
    );

    this.doAs('list', 'set-range', {
      filterName: this.props.name,
      from,
      to,
    });
  }

  handleSliderTo(value) {
    const to = this.sliderToExternal(value);
    const from = this.sliderToExternal(
      Math.min(this.externalToSlider(this.props.from), value)
    );

    this.doAs('list', 'set-range', {
      filterName: this.props.name,
      from,
      to,
    });
  }

  /******************************************************************************/

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
              barColor="#f00"
              min={0}
              max={this.externalToSlider(this.props.max)}
              step={1}
              value={this.externalToSlider(this.props.from)}
              changeMode="throttled"
              throttleDelay={200}
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
              barColor="#f00"
              barPosition="end"
              min={0}
              max={this.externalToSlider(this.props.max)}
              step={1}
              value={this.externalToSlider(this.props.to)}
              changeMode="throttled"
              throttleDelay={200}
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
    const min = range.get('min');
    const max = range.get('max');
    const from = range.get('from', min);
    const to = range.get('to', max);

    return {min, max, from, to};
  } else {
    return {loading: true};
  }
})(FacetFilterRangeDialog);
