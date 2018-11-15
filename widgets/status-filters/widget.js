import React from 'react';
import Widget from 'laboratory/widget';

import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import CheckButton from 'gadgets/check-button/widget';

class StatusFilter extends Widget {
  constructor() {
    super(...arguments);
    this.changeStatus = this.changeStatus.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      contentIndex: 'contentIndex',
    };
  }

  _changeStatus(changed, newState) {
    const newStatusList = ['draft', 'published', 'archived'].reduce(
      (state, status) => {
        if (changed === status) {
          if (newState) {
            state.push(status);
          }
        } else {
          const isInList = this.props.contentIndex
            .get('value')
            .contains(status);
          if (isInList) {
            state.push(status);
          }
        }
        return state;
      },
      []
    );
    this.doAs('list', 'change-content-index', {
      name: 'status',
      value: newStatusList,
    });
  }

  buildStatusFlag() {
    return ['draft', 'published', 'archived'].reduce((state, status) => {
      state[status] = this.props.contentIndex.get('value').contains(status);
      return state;
    }, {});
  }

  changeStatus(status) {
    return () => this._changeStatus(status, !this.buildStatusFlag()[status]);
  }

  render() {
    const {id, contentIndex} = this.props;
    if (!id || !contentIndex) {
      return null;
    }

    const {published, draft, archived} = this.buildStatusFlag();
    return (
      <Container kind="row-pane">
        <Container kind="column" grow="1">
          <Container kind="row">
            <Label width="30px" />
            <CheckButton
              justify="left"
              heightStrategy="compact"
              text="Brouillons"
              tooltip="Montre les brouillons"
              checked={draft}
              onClick={this.changeStatus('draft')}
            />
          </Container>
          <Container kind="row">
            <Label width="30px" />
            <CheckButton
              justify="left"
              heightStrategy="compact"
              text="Publiés"
              tooltip="Montre les éléments publiés"
              checked={published}
              onClick={this.changeStatus('published')}
            />
          </Container>
          <Container kind="row">
            <Label width="30px" />
            <CheckButton
              justify="left"
              heightStrategy="compact"
              text="Archivés"
              tooltip="Montre les éléments archivés"
              checked={archived}
              onClick={this.changeStatus('archived')}
            />
          </Container>
        </Container>
      </Container>
    );
  }
}

export default Widget.Wired(StatusFilter)();
