import T from 't';
import React from 'react';
import Widget from 'laboratory/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import FacetFilterButton from 'goblin-desktop/widgets/facet-filter-button/widget';

/******************************************************************************/

export default class FacetFilter extends Widget {
  constructor() {
    super(...arguments);
    this.changeFacet = this.changeFacet.bind(this);
    this.toggle = this.toggle.bind(this);
    this.clearAllFacets = this.clearAllFacets.bind(this);
    this.setAllFacets = this.setAllFacets.bind(this);
    this.toggleAllFacets = this.toggleAllFacets.bind(this);
    this.state = {opened: false};
  }

  toggle() {
    this.setState({opened: !this.state.opened});
  }

  _changeFacet(changed, newState) {
    const newValueList = [];
    for (const value of this.props.facets.values()) {
      const filter = value.get('key');
      if (changed === filter.toString()) {
        if (newState) {
          newValueList.push(filter);
        }
      } else {
        const isInList = this.props.filter.get('value').contains(filter);
        if (isInList) {
          newValueList.push(filter);
        }
      }
    }
    const searchId = this.props.id
      .split('@')
      .splice(1)
      .join('@');

    const value = this.getState()
      .widgets.get(searchId)
      .get('value');

    console.log(value);
    this.doAs('list', 'customize-visualization', {
      value,
      filter: {
        name: this.props.filter.get('name'),
        value: newValueList,
      },
    });
  }

  clearAllFacets() {
    this.doAs('list', 'customize-visualization', {
      filter: {
        name: this.props.filter.get('name'),
        value: this.props.facets.map(f => f.get('key')).toArray(),
      },
    });
  }

  setAllFacets() {
    this.doAs('list', 'customize-visualization', {
      filter: {
        name: this.props.filter.get('name'),
        value: [],
      },
    });
  }

  toggleAllFacets() {
    const newValueList = [];
    for (const value of this.props.facets.values()) {
      const filter = value.get('key');
      if (!this.props.filter.get('value').contains(filter)) {
        newValueList.push(filter);
      }
    }
    this.doAs('list', 'customize-visualization', {
      filter: {
        name: this.props.filter.get('name'),
        value: newValueList,
      },
    });
  }

  buildValueFlag() {
    return this.props.facets.reduce((state, facet) => {
      const value = facet.get('key');
      state[value] = {
        count: facet.get('doc_count'),
        checked: this.props.filter.get('value').contains(value),
      };
      return state;
    }, {});
  }

  changeFacet(facet) {
    return () => {
      this.flags[facet].checked = !this.flags[facet].checked;
      this._changeFacet(facet, this.flags[facet].checked);
    };
  }

  /******************************************************************************/

  renderDialogClose() {
    return (
      <div className={this.styles.classNames.closeButton}>
        <Button
          border="none"
          glyph="solid/times"
          glyphSize="120%"
          height="32px"
          width="32px"
          onClick={this.toggle}
        />
      </div>
    );
  }

  renderDialogButton(props, index) {
    const glyph = props.checked ? 'solid/check-square' : 'regular/square';

    return (
      <div key={index} className={this.styles.classNames.dialogButton}>
        <Button
          grow="1"
          height="20px"
          border="none"
          justify="left"
          heightStrategy="compact"
          text={props.text}
          glyph={glyph}
          onClick={props.onChange}
        />
        <Label text={props.count} />
      </div>
    );
  }

  renderDialogFooter(enableClearAll, enableSetAll) {
    return (
      <div className={this.styles.classNames.dialogFooter}>
        {enableClearAll ? (
          <Button
            border="none"
            glyph={'regular/square'}
            text={T('Tout décocher')}
            onClick={this.clearAllFacets}
          />
        ) : null}
        {enableSetAll ? (
          <Button
            border="none"
            glyph={'solid/check-square'}
            text={T('Tout cocher')}
            onClick={this.setAllFacets}
          />
        ) : null}
        {enableClearAll && enableSetAll ? (
          <Button
            border="none"
            glyph={'solid/sync'}
            text={T('Tout inverser')}
            onClick={this.toggleAllFacets}
          />
        ) : null}
      </div>
    );
  }

  renderDialog() {
    const flags = this.buildValueFlag();
    this.flags = flags;

    const rows = [];
    let enableClearAll = false;
    let enableSetAll = false;
    for (const [key, flag] of Object.entries(flags)) {
      rows.push({
        text: key,
        count: flag.count,
        checked: !flag.checked,
        onChange: this.changeFacet(key),
      });
      if (flag.checked) {
        enableSetAll = true;
      } else {
        enableClearAll = true;
      }
    }

    const windowHeight = window.innerHeight;
    const r = this.buttonNode.getBoundingClientRect();
    const count = this.props.facets.size;
    const height = Math.min(count * 20 + 100, windowHeight - 20);
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
        width="480px"
        height={height + 'px'}
        left={r.right + 40 + 'px'}
        center={centerY + 'px'}
        triangleShift={shiftY + 'px'}
        close={this.toggle}
      >
        <div className={this.styles.classNames.dialogContent}>
          <div className={this.styles.classNames.dialogButtons}>
            <div className={this.styles.classNames.dialogScrollable}>
              {rows.map((props, index) =>
                this.renderDialogButton(props, index)
              )}
            </div>
          </div>
          {this.renderDialogFooter(enableClearAll, enableSetAll)}
          {this.renderDialogClose()}
        </div>
      </DialogModal>
    );
  }

  render() {
    const {name, filter, facets} = this.props;
    if (!filter || !facets) {
      return null;
    }

    let total = 0;
    let totalInList = 0;
    for (const value of this.props.facets.values()) {
      const filter = value.get('key');
      const isInList = this.props.filter.get('value').contains(filter);
      total = total + value.get('doc_count');
      if (!isInList) {
        totalInList = totalInList + value.get('doc_count');
      }
    }

    return (
      <div ref={node => (this.buttonNode = node)}>
        <FacetFilterButton
          text={name}
          count={totalInList}
          total={total}
          active={this.state.opened ? true : false}
          onClick={this.toggle}
        />
        {this.state.opened ? this.renderDialog() : null}
      </div>
    );
  }
}

/******************************************************************************/
