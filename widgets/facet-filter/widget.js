//T:2019-02-27

import React from 'react';
import Widget from 'laboratory/widget';

import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import Checkbox from 'gadgets/checkbox/widget';
import ScrollableContainer from 'gadgets/scrollable-container/widget';
import T from 't';

class FacetFilter extends Widget {
  constructor() {
    super(...arguments);
    this.changeFacet = this.changeFacet.bind(this);
  }

  _changeFacet(changed, newState) {
    const newValueList = this.props.facets.keys().reduce((state, value) => {
      if (changed === value) {
        if (newState) {
          state.push(value);
        }
      } else {
        const isInList = this.props.filter.get('value').contains(value);
        if (isInList) {
          state.push(value);
        }
      }
      return state;
    }, []);
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
    return () => this._changeFacet(facet, !this.buildValueFlag()[facet]);
  }

  render() {
    const flags = this.buildValueFlag();
    return (
      <ScrollableContainer kind="panes" id={this.props.id} restoreScroll={true}>
        <Container kind="pane">
          {Object.entries(flags).map(([key, flag], index) => {
            return (
              <Container kind="row" key={index}>
                <Label width="30px" />
                <Checkbox
                  justify="left"
                  heightStrategy="compact"
                  text={key}
                  checked={flag.checked}
                  onChange={this.changeFacet(key)}
                />
                {flag.count}
              </Container>
            );
          })}
        </Container>
      </ScrollableContainer>
    );
  }
}
export default FacetFilter;
