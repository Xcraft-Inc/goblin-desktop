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
    this.toggleAllFacets = this.toggleAllFacets.bind(this);
    this.state = {opened: false, mode: 'all'};
  }

  toggle() {
    this.setState({opened: !this.state.opened});
  }

  _changeFacet(changed, newState) {
    this.setState({mode: 'custom'});
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

  toggleAllFacets() {
    switch (this.state.mode) {
      case 'none':
        this.setState({mode: 'all'});
        this.doAs('list', 'customize-visualization', {
          filter: {
            name: this.props.filter.get('name'),
            value: [],
          },
        });
        break;
      case 'custom':
      case 'all':
        this.setState({mode: 'none'});
        this.doAs('list', 'customize-visualization', {
          filter: {
            name: this.props.filter.get('name'),
            value: this.props.facets.map(f => f.get('key')).toArray(),
          },
        });
        break;
    }
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

  renderDialogButton(key, props) {
    const glyph = props.checked ? 'solid/check-square' : 'regular/square';

    return (
      <div key={key} className={this.styles.classNames.dialogButton}>
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

  renderDialog() {
    const flags = this.buildValueFlag();
    this.flags = flags;

    const count = this.props.facets.size;
    // const numberOfColumns = Math.round(count / (count * 0.33));
    const numberOfColumns = 1;
    const columns = Object.entries(flags).reduce(
      (columns, [key, flag], index) => {
        const colNumber = index % numberOfColumns;
        if (!columns[colNumber]) {
          columns[colNumber] = [];
        }
        columns[colNumber].push({
          text: key,
          count: flag.count,
          checked: !flag.checked,
          onChange: this.changeFacet(key),
        });
        return columns;
      },
      []
    );

    let toggleGlyph;
    let toggleText;
    switch (this.state.mode) {
      case 'none':
        toggleGlyph = 'solid/check-square';
        toggleText = T('Tout cocher');
        break;
      case 'custom':
      case 'all':
        toggleGlyph = 'regular/square';
        toggleText = T('Tout décocher');
        break;
    }

    const windowHeight = window.innerHeight;
    const r = this.buttonNode.getBoundingClientRect();
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
        width="400px"
        height={height + 'px'}
        left={r.right + 40 + 'px'}
        center={centerY + 'px'}
        triangleShift={shiftY + 'px'}
        close={this.toggle}
      >
        <div className={this.styles.classNames.dialogContent}>
          <div className={this.styles.classNames.dialogButtons}>
            <div className={this.styles.classNames.dialogScrollable}>
              {columns.map((nodes, index) => {
                return (
                  <Container kind="column" key={index}>
                    {nodes.map((props, key) =>
                      this.renderDialogButton(key, props)
                    )}
                  </Container>
                );
              })}
            </div>
          </div>
          <div className={this.styles.classNames.dialogFooter}>
            <Button
              border="none"
              glyph={toggleGlyph}
              text={toggleText}
              onClick={this.toggleAllFacets}
            />
          </div>
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
        </div>
      </DialogModal>
    );
  }

  render() {
    const {name, filter, facets} = this.props;
    if (!filter || !facets) {
      return null;
    }

    let toggleGlyph;
    switch (this.state.mode) {
      case 'all':
        toggleGlyph = 'solid/square';
        break;
      case 'custom':
        toggleGlyph = 'solid/circle';
        break;
      case 'none':
        toggleGlyph = 'regular/square';
        break;
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
          glyph={toggleGlyph}
          active={this.state.opened ? true : false}
          onClick={this.toggle}
        />
        {this.state.opened ? this.renderDialog() : null}
      </div>
    );
  }
}

/******************************************************************************/
