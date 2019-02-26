import React from 'react';
import ReactDOM from 'react-dom';
import Widget from 'laboratory/widget';

import {Unit} from 'electrum-theme';
import Button from 'gadgets/button/widget';
import Combo from 'gadgets/combo/widget';

/******************************************************************************/

class MainTabMenu extends Widget {
  constructor() {
    super(...arguments);

    this.comboButton = null;

    this.state = {
      showMenu: false,
    };
    this.onChange = this.onChange.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
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

  onChange(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
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
          action: () => this.onChange(value),
        };
      });

      return (
        <Combo
          menuType="wrap"
          width="200px"
          left={(rect.left + rect.right) / 2}
          top={top}
          list={list}
          close={() => (this.showMenu = false)}
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
          onClick={() => (this.showMenu = true)}
          {...other}
        />
        <div className={contentClass}>{this.renderMenu()}</div>
      </div>
    );
  }
}

/******************************************************************************/
export default MainTabMenu;
