//T:2019-02-27

import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Container from 'goblin-gadgets/widgets/container/widget';
import * as styles from './styles';

class DatagridItem extends Widget {
  constructor() {
    super(...arguments);
    this.styles = styles;

    this.renewTTL = this.renewTTL.bind(this);
    this.renderItem = this.renderItem.bind(this);
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

  renderItem() {
    const {id, item, onDrillDown} = this.props;
    const loaded = id && item;

    if (onDrillDown && id && this._idRequested !== id) {
      setTimeout(onDrillDown, 0, id);
      this.renewTTL(id);
      this._idRequested = id;
    }

    if (!loaded) {
      return <FontAwesomeIcon icon={[`fas`, 'spinner']} size={'1x'} pulse />;
    }

    const Item = this.props.renderItem;
    return (
      <Item
        id={item.get('id')}
        index={this.props.index}
        listId={this.props.listId}
        itemId={this.props.itemId}
        height={this.props.height}
        onDrillDown={this.props.onDrillDown}
      />
    );
  }

  render() {
    return (
      <Container className={this.styles.classNames.row} kind="content">
        {this.renderItem()}
      </Container>
    );
  }
}

export default Widget.connect((state, props) => {
  const listIds = state.get(`backend.${props.listId}.list`);

  return {
    id: listIds.get(`${props.index}-item`, null),
    item: state.get(`backend.${listIds.get(`${props.index}-item`)}`),
  };
})(DatagridItem);
