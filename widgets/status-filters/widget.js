import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import FacetFilter from 'goblin-desktop/widgets/facet-filter/widget';

const managedStatus = ['draft', 'published', 'archived', 'trashed'];
class StatusFilter extends Widget {
  constructor() {
    super(...arguments);
    this.changeStatus = this.changeStatus.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      filters: 'options.filters',
      facets: 'facets',
    };
  }

  _changeStatus(changed, newState) {
    const newStatusList = managedStatus.reduce((state, status) => {
      if (changed === status) {
        if (newState) {
          state.push(status);
        }
      } else {
        const isInList = this.props.filter.get('value').has(status);
        if (isInList) {
          state.push(status);
        }
      }
      return state;
    }, []);
    this.doAs('list', 'customize-visualization', {
      filter: {
        name: 'status',
        value: newStatusList,
      },
    });
  }

  buildStatusFlag() {
    return managedStatus.reduce((state, status) => {
      state[status] = this.props.filter.get('value').has(status);
      return state;
    }, {});
  }

  changeStatus(status) {
    return () => this._changeStatus(status, !this.buildStatusFlag()[status]);
  }

  render() {
    let {id, facets, filters} = this.props;
    if (!id || !facets) {
      return null;
    }
    return (
      <React.Fragment>
        {Array.from(facets.entries()).map(([k, v], i) => {
          return (
            <FacetFilter
              id={this.props.id}
              key={i}
              name={k}
              facets={v}
              filter={filters.get(k)}
            />
          );
        })}
      </React.Fragment>
    );
  }
}

export default Widget.Wired(StatusFilter)();
