//T:2019-02-27

import React from 'react';
import Widget from 'laboratory/widget';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

class DatagridItem extends Widget {
  constructor() {
    super(...arguments);

    this._height = 40;
    this.renewTTL = this.renewTTL.bind(this);
    this._idRequested = null;
    this._renewInterval = null;
  }

  renewTTL(id) {
    if (this._renewInterval) {
      clearInterval(this._renewInterval);
    }
    this._renewInterval = setInterval(this.props.onDrillDown, 15000, id);
  }

  componentWillUnmount() {
    clearInterval(this._renewInterval);
  }

  render() {
    const {id, item} = this.props;
    const loaded = id && item;

    if (!loaded) {
      if (id && this._idRequested !== id) {
        setTimeout(this.props.onDrillDown, 0, id);
        this.renewTTL(id);
        this._idRequested = id;
      }
      return <FontAwesomeIcon icon={[`fas`, 'spinner']} size={'1x'} pulse />;
    }

    const Item = this.props.renderItem;
    return (
      <Item
        id={item.get('id')}
        index={this.props.index}
        listId={this.props.listId}
        itemId={this.props.itemId}
        height={this._height}
        onDrillDown={this.props.onDrillDown}
      />
    );
  }
}

export default Widget.connect((state, props) => {
  const listIds = state.get(`backend.${props.listId}.list`);

  return {
    id: listIds.get(`${props.index}`, null),
    item: state.get(`backend.${listIds.get(`${props.index}`)}`),
  };
})(DatagridItem);
