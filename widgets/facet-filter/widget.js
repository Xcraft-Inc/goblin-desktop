import T from 't';
import React from 'react';
import Widget from 'laboratory/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Container from 'gadgets/container/widget';
import Checkbox from 'gadgets/checkbox/widget';
import Label from 'gadgets/label/widget';

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

  renderDialog() {
    const flags = this.buildValueFlag();
    this.flags = flags;
    const count = this.props.facets.size;
    const numberOfColumns = Math.round(count / (count * 0.33));
    const columns = Object.entries(flags).reduce(
      (columns, [key, flag], index) => {
        const colNumber = index % numberOfColumns;
        if (!columns[colNumber]) {
          columns[colNumber] = [];
        }
        columns[colNumber].push({
          text: `${key} (${flag.count})`,
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

    return (
      <DialogModal minWidth="600px" minHeight="400px">
        <div className={this.styles.classNames.dialogContent}>
          <div className={this.styles.classNames.dialogHeader}>
            <Label kind="pane-header" text={this.props.name} />
          </div>
          <div className={this.styles.classNames.dialogButtons}>
            {columns.map((nodes, index) => {
              return (
                <Container kind="column" key={index}>
                  {nodes.map((props, key) => {
                    return (
                      <Container kind="row" key={key}>
                        <Checkbox
                          justify="left"
                          heightStrategy="compact"
                          {...props}
                        />
                      </Container>
                    );
                  })}
                </Container>
              );
            })}
          </div>
          <div className={this.styles.classNames.dialogFooter}>
            <Button
              border="none"
              glyph={toggleGlyph}
              text={toggleText}
              onClick={this.toggleAllFacets}
            />
            <div className={this.styles.classNames.sajex} />
            <Button
              glyph="solid/times"
              text={T('Fermer', 'dialogue')}
              kind="action"
              place="1/1"
              width="150px"
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

    const text = `${name} (${totalInList}/${total})`;

    return (
      <React.Fragment>
        <Button
          kind="calendar-title"
          justify="between"
          glyphPosition="right"
          glyph={toggleGlyph}
          onClick={this.toggle}
          grow="1"
          text={text}
          focusable={true}
          active={this.state.opened ? true : false}
        />
        {this.state.opened ? this.renderDialog() : null}
      </React.Fragment>
    );
  }
}
