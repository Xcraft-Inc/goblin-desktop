import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Gauge from 'goblin-gadgets/widgets/gauge/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import T from 't';
import TT from 'goblin-nabu/widgets/t/widget';
import FacetHelpers from '../helpers/facet-helpers';
import {date as DateConverters} from 'xcraft-core-converters';

/******************************************************************************/

class FacetFilterButton extends Widget {
  constructor() {
    super(...arguments);
  }

  isFull(count, total) {
    return count === total;
  }

  /******************************************************************************/

  renderText() {
    return (
      <TT
        msgid={this.props.displayName}
        className={this.styles.classNames.text}
      />
    );
  }

  renderCount(count, total) {
    let text;
    if (this.isFull(count, total)) {
      text = T('Tout');
    } else {
      text = count;
    }

    return <TT msgid={text} className={this.styles.classNames.count} />;
  }

  renderGauge(count, total) {
    if (this.isFull(count, total)) {
      return null;
    }

    const value = (count * 100) / total;

    return (
      <Gauge
        kind="rounded"
        gradient="red-yellow-green"
        direction="horizontal"
        height="12px"
        width="50px"
        value={value}
      />
    );
  }

  renderTop(count, total) {
    return (
      <div className={this.styles.classNames.top}>
        {this.renderText()}
        {this.renderCount(count, total)}
        {this.renderGauge(count, total)}
      </div>
    );
  }

  renderFilter(glyph, array) {
    const type = FacetHelpers.getType(array);
    const schema = this.getSchema(this.props.entityType);
    const prop = this.props.name.replace('/', '.');
    const propInfos = schema.get(prop);

    return (
      <>
        <Label fontSize="80%" glyph={glyph} />
        {array.map((t, k) => {
          return (
            <Label
              key={k}
              fontSize="80%"
              text={FacetHelpers.format(t, type, propInfos)}
            />
          );
        })}
      </>
    );
  }

  renderBottomList(count, total) {
    if (this.isFull(count, total)) {
      return null;
    }

    const sets = [];
    const clears = [];
    for (const [key, flag] of this.props.flags.entries()) {
      if (flag.get('checked') === false) {
        clears.push(key);
      } else {
        sets.push(key);
      }
    }

    return (
      <div className={this.styles.classNames.bottom}>
        {sets.length <= clears.length
          ? this.renderFilter('solid/eye', sets)
          : this.renderFilter('solid/eye-slash', clears)}
      </div>
    );
  }

  renderBottomRange() {
    if (!this.props.useRange) {
      return null;
    }

    const from = DateConverters.getDisplayed(this.props.from);
    const to = DateConverters.getDisplayed(this.props.to);
    const text = `${from} .. ${to}`;

    return (
      <div className={this.styles.classNames.bottom}>
        <Label fontSize="80%" text={text} />
      </div>
    );
  }

  renderBottom(count, total) {
    if (FacetHelpers.isRange(this.props.type)) {
      return this.renderBottomRange();
    } else {
      return this.renderBottomList(count, total);
    }
  }

  render() {
    if (this.props.loading) {
      return null;
    }

    let total = 0;
    let count = 0;
    let style = this.styles.classNames.facetFilterButton;

    if (FacetHelpers.isRange(this.props.type)) {
      for (const value of this.props.facets.values()) {
        if (this.props.useRange) {
          let filter = value.get('key');
          if (this.props.type === 'date' && typeof filter === 'string') {
            filter = filter.substring(0, 10); // trunc "2020-02-10T00:00:00.000Z" to "2020-02-10"
          }
          if (filter >= this.props.from && filter <= this.props.to) {
            count = count + value.get('doc_count');
          }
        } else {
          count = count + value.get('doc_count');
        }
        total = total + value.get('doc_count');
      }
    } else {
      for (const value of this.props.facets.values()) {
        const filter = value.get('key');
        const isChecked = this.props.flags._state.get(filter).get('checked');
        total = total + value.get('doc_count');
        if (isChecked) {
          count = count + value.get('doc_count');
        }
      }
      const disabled = this.props.numberOfCheckboxes <= 1;
      if (disabled) {
        return null;
      }
      /*style = disabled
        ? this.styles.classNames.facetFilterButtonDisabled
        : this.styles.classNames.facetFilterButton;*/
    }

    return (
      <div className={style} onClick={this.props.onClick}>
        {this.renderTop(count, total)}
        {this.renderBottom(count, total)}
      </div>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state, props) => {
  if (FacetHelpers.isRange(props.type)) {
    const range = state.get(`backend.${props.id}.ranges.${props.name}`);
    if (range) {
      const useRange = range.get('useRange', false);
      const min = range.get('min');
      const max = range.get('max');
      const from = range.get('from', min);
      const to = range.get('to', max);

      return {useRange, min, max, from, to};
    } else {
      return {loading: true};
    }
  } else {
    const flags = state.get(`backend.${props.id}.checkboxes.${props.name}`);
    if (flags) {
      return {flags, numberOfCheckboxes: flags.size};
    } else {
      return {loading: true};
    }
  }
})(FacetFilterButton);
