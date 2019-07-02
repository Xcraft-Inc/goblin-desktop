//T:2019-02-27

import React from 'react';
import Widget from 'laboratory/widget';

import Container from 'gadgets/container/widget';
import FacetFilter from 'goblin-desktop/widgets/facet-filter/widget';
import Label from 'gadgets/label/widget';
import Checkbox from 'gadgets/checkbox/widget';
import T from 't';

const managedStatus = ['draft', 'published', 'archived', 'trashed'];
class StatusFilter extends Widget {
  constructor() {
    super(...arguments);
    this.changeStatus = this.changeStatus.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      filter: 'options.filter',
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
        const isInList = this.props.filter.get('value').contains(status);
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
      state[status] = this.props.filter.get('value').contains(status);
      return state;
    }, {});
  }

  changeStatus(status) {
    return () => this._changeStatus(status, !this.buildStatusFlag()[status]);
  }

  render() {
    const {id, facets, filter} = this.props;
    if (!id) {
      return null;
    }

    return (
      <FacetFilter
        id={this.props.id}
        name="customers"
        facets={facets.get('customers')}
        filter={filter}
      />
    );
  }

  /*render() {
    const {id, filter} = this.props;
    if (!id || !filter) {
      return null;
    }

    const {published, draft, archived, trashed} = this.buildStatusFlag();
    return (
      <Container kind="row-pane">
        <Container kind="column" grow="1">
          <Container kind="row">
            <Label width="30px" />
            <Checkbox
              justify="left"
              heightStrategy="compact"
              text={T('Brouillons')}
              tooltip={T('Montre les brouillons')}
              checked={draft}
              onChange={this.changeStatus('draft')}
            />
          </Container>
          <Container kind="row">
            <Label width="30px" />
            <Checkbox
              justify="left"
              heightStrategy="compact"
              text={T('Publiés')}
              tooltip={T('Montre les éléments publiés')}
              checked={published}
              onChange={this.changeStatus('published')}
            />
          </Container>
          <Container kind="row">
            <Label width="30px" />
            <Checkbox
              justify="left"
              heightStrategy="compact"
              text={T('Archivés')}
              tooltip={T('Montre les éléments archivés')}
              checked={archived}
              onChange={this.changeStatus('archived')}
            />
          </Container>
          <Container kind="row">
            <Label width="30px" />
            <Checkbox
              justify="left"
              heightStrategy="compact"
              text={T('Supprimés')}
              tooltip={T('Montre les éléments supprimés')}
              checked={trashed}
              onChange={this.changeStatus('trashed')}
            />
          </Container>
        </Container>
      </Container>
    );
  }*/
}

export default Widget.Wired(StatusFilter)();
