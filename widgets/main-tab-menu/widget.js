//T:2019-02-27
import React from 'react';
import ReactDOM from 'react-dom';
import Widget from 'goblin-laboratory/widgets/widget';

import {Unit} from 'electrum-theme';
import Button from 'goblin-gadgets/widgets/button/widget';
import Combo from 'goblin-gadgets/widgets/combo/widget';

/******************************************************************************/

class MainTabMenu extends Widget {
  constructor() {
    super(...arguments);

    this.comboButton = null;

    this.state = {
      showMenu: false,
    };
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.close = this.close.bind(this);
  }

  componentDidMount() {
    super.componentDidMount();
    this.combo = ReactDOM.findDOMNode(this.comboButton);
  }

  get showMenu() {
    return this.state.showMenu;
  }

  get currentItem() {
    return this.props.currentItemValue;
  }

  set showMenu(value) {
    this.setState({
      showMenu: value,
    });
  }

  onChange(value, text) {
    if (this.props.onChange) {
      this.props.onChange(value, text);
    }
  }

  onClick() {
    this.showMenu = true;
  }

  close() {
    this.showMenu = false;
  }

  /******************************************************************************/

  renderMenu() {
    if (this.showMenu && this.props.items) {
      const rect = this.combo.getBoundingClientRect();
      const top = Unit.add(
        rect.bottom + 'px',
        this.context.theme.shapes.flyingBalloonTriangleSize
      );

      const list = this.props.items.map(item => {
        const text = this.props.itemsTextKey
          ? item.get(this.props.itemsTextKey)
          : item.text;
        const value = this.props.itemsValueKey
          ? item.get(this.props.itemsValueKey)
          : item.value;
        return {
          text,
          active: value === this.currentItem,
          action: () => this.onChange(value, text),
        };
      });

      return (
        <Combo
          menuType="wrap"
          width="200px"
          left={(rect.left + rect.right) / 2}
          top={top}
          list={list}
          close={this.close}
        />
      );
    } else {
      return null;
    }
  }

  render() {
    const {
      items,
      onChange,
      currentItemValue,
      itemsTextKey,
      itemsValueKey,
      ...other
    } = this.props;
    const contentClass = this.styles.classNames.content;

    return (
      <div>
        <Button
          ref={x => (this.comboButton = x)}
          active={this.showMenu}
          onClick={this.onClick}
          {...other}
        />
        <div className={contentClass}>{this.renderMenu()}</div>
      </div>
    );
  }
}

/******************************************************************************/
export default MainTabMenu;
