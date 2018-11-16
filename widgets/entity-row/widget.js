import React from 'react';
import Widget from 'laboratory/widget';
import TableCell from 'gadgets/table-cell/widget';

class _Driller extends Widget {
  constructor() {
    super(...arguments);
    this._loadRequested = false;
  }

  render() {
    if (this.props.loaded) {
      return (
        <TableCell
          grow="1"
          isLast="false"
          isHeader="false"
          text={this.props.text}
        />
      );
    } else {
      if (this._loadRequested === false) {
        this.props.onDrillDown(this.props.entityId);
        this._loadRequested = true;
      }
      return (
        <TableCell
          grow="1"
          isLast="false"
          isHeader="false"
          text="chargement..."
        />
      );
    }
  }
}

const Driller = Widget.connect((state, props) => {
  const loaded = !!state.get(`backend.${props.entityId}.id`, null);
  return {
    entityId: props.entityId,
    loaded: loaded,
    text: loaded
      ? state.get(`backend.${props.entityId}.meta.summaries.info`)
      : '',
  };
})(_Driller);

class EntityRow extends Widget {
  constructor() {
    super(...arguments);
  }

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
            return (
              <Driller
                entityId={text}
                rowId={i}
                key={c}
                onDrillDown={this.props.onDrillDown}
              />
            );
          } else {
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
          }
        })}
      </div>
    );
  }
}

export default Widget.connect((state, props) => {
  return {
    id: props.id,
    entity: state.get(`backend.${props.id}`),
  };
})(EntityRow);
