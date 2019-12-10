//
import T from 't';
import React from 'react';
import Widget from 'laboratory/widget';

import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import Checkbox from 'gadgets/checkbox/widget';

class FacetFilter extends Widget {
  constructor() {
    super(...arguments);
    this.changeFacet = this.changeFacet.bind(this);
  }

  _changeFacet(changed, newState) {
    const newValueList = [];
    for (const value of this.props.facets.values()) {
      const filter = value.get('key');
      if (changed === filter) {
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
    return () =>
      this._changeFacet(facet, !this.buildValueFlag()[facet].checked);
  }

  render() {
    const {name, filter, facets} = this.props;
    if (!filter || !facets) {
      return null;
    }
    const flags = this.buildValueFlag();
    return (
      <Container kind="pane">
        <Label kind="title" text={name} />
        {Object.entries(flags).map(([key, flag], index) => {
          return (
            <Container kind="row" key={index}>
              <Checkbox
                justify="left"
                heightStrategy="compact"
                text={key}
                checked={!flag.checked}
                onChange={this.changeFacet(key)}
              />
              {flag.count}
            </Container>
          );
        })}
      </Container>
    );
  }
}
export default FacetFilter;
