import React from 'react';
import Widget from 'laboratory/widget';
import Container from 'gadgets/container/widget';
import ScrollableContainer from 'gadgets/scrollable-container/widget';
import List from 'gadgets/list/widget';
import TableCell from 'gadgets/table-cell/widget';
import Label from 'gadgets/label/widget';

class _Entity extends Widget {
  render() {
    const {id, rowIndex, entity, columns} = this.props;
    if (!id || !entity) {
      return null;
    }
    const rowStyle = {
      borderTop: '1px solid #aaa',
      display: 'flex',
      flexDirection: 'row',
      padding: '5px 1px 5px 1px',
      backgroundColor: rowIndex % 2 === 0 ? '#eee' : 'white',
      cursor: 'default',
    };
    return (
      <div style={rowStyle}>
        {columns.map((c, i) => {
          let text = entity.get(c, null);
          if (entity.get('meta.references').has(c) && text !== null) {
            const ref = this.getBackendValue(`backend.${text}`);
            if (ref) {
              text = ref.get('meta.summaries.info');
            }
          }
          return (
            <TableCell
              rowId={i}
              key={c}
              index={i}
              grow="1"
              isLast="false"
              isHeader="false"
              text={text}
            />
          );
        })}
      </div>
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
        kind="content"
        grow="1"
        busy={!this.props.id}
      >
        {this.props.id ? (
          <Entity
            id={this.props.id}
            itemId={this.props.itemId}
            columns={this.props.columns}
            rowIndex={this.props.rowIndex}
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
    rowIndex: props.index,
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
            return (
              <TableCell
                key={c}
                width={undefined}
                level={1}
                textAlign={undefined}
                indent={undefined}
                fontSizeStrategy={undefined}
                isLast="false"
                isHeader="true"
                grow="1"
                text={c}
              />
            );
          })}
        </div>
        <ScrollableContainer id={listId} height="100%">
          <List id={listId} renderItem={ListItem} parentId={columns} />
        </ScrollableContainer>
      </div>
    );
  }
}

export default Widget.Wired(EntityList)();
