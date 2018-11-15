import React from 'react';
import Widget from 'laboratory/widget';
import Container from 'gadgets/container/widget';
import List from 'gadgets/list/widget';
import Label from 'gadgets/label/widget';

class _Entity extends Widget {
  render() {
    const {id, entity, columns} = this.props;
    if (!id || !entity) {
      return null;
    }
    return (
      <Container kind="row">
        {columns.map(c => {
          return (
            <Container key={c} kind="column" grow="1">
              <Container kind="row">
                <Label text={entity.get(c, '')} />
              </Container>
            </Container>
          );
        })}
      </Container>
    );
  }
}

const Entity = Widget.connect((state, props) => {
  return {
    id: props.id,
    entity: state.get(`backend.${props.id}`),
  };
})(_Entity);

class _ListItem extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    const containerProps = {};
    if (!this.props.id && this.props.height) {
      containerProps.height = `${this.props.height}px`;
    }
    return (
      <Container
        {...containerProps}
        kind="row"
        grow="1"
        width="100%"
        busy={!this.props.id}
      >
        {this.props.id ? (
          <Entity
            id={this.props.id}
            itemId={this.props.itemId}
            columns={this.props.columns}
          />
        ) : null}
      </Container>
    );
  }
}

const ListItem = Widget.connect((state, props) => {
  const id = state.get(`backend.${props.listId}.list.${props.itemId}`, null);
  return {
    id,
    height: props.height,
    itemId: props.itemId,
    columns: props.parentId,
  };
})(_ListItem);

class EntityList extends Widget {
  static get wiring() {
    return {
      id: 'id',
      columns: 'columns',
    };
  }

  render() {
    const {id, columns} = this.props;
    const listId = `list@${id}`;
    if (!id) {
      return null;
    }
    return (
      <div className={this.styles.classNames.full}>
        <div className={this.styles.classNames.header}>
          {columns.map(c => {
            return <Label key={c} text={c} />;
          })}
        </div>
        <div className={this.styles.classNames.list}>
          <List id={listId} renderItem={ListItem} parentId={columns} />
        </div>
      </div>
    );
  }
}

export default Widget.Wired(EntityList)();
