//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';

import {Unit} from 'goblin-theme';
const px = Unit.toPx;
import Button from 'goblin-gadgets/widgets/button/widget';
import Combo from 'goblin-gadgets/widgets/combo/widget';

/******************************************************************************/

export default class MainTabMenu extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      showMenu: false,
    };

    this.combo = null;
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.close = this.close.bind(this);
  }

  componentDidMount() {
    super.componentDidMount();
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
      if (this.combo) {
        const rect = this.combo.getBoundingClientRect();
        const top = Unit.add(
          px(rect.bottom),
          this.context.theme.shapes.flyingBalloonTriangleSize
        );

        const list = this.props.items.map((item) => {
          const text = this.props.itemsTextKey
            ? item.get(this.props.itemsTextKey)
            : item.text;
          const value = this.props.itemsValueKey
            ? item.get(this.props.itemsValueKey)
            : item.value;
          return {
            text,
            glyph: item.glyph,
            color: item.glyphColor,
            separator: item.separator,
            kind: item.kind,
            active: value === this.currentItem,
            action: () => this.onChange(value, text),
          };
        });

        var left = px((rect.left + rect.right) / 2);
        if (this.props.horizontalShift) {
          left = Unit.add(left, this.props.horizontalShift);
        }

        return (
          <Combo
            menuType="wrap"
            width="200px"
            left={left}
            triangleShift={this.props.horizontalShift}
            top={top}
            list={list}
            close={this.close}
          />
        );
      }
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
      ...otherProps
    } = this.props;
    const contentClass = this.styles.classNames.content;

    return (
      <div>
        <Button
          ref={(x) => (this.combo = x)}
          active={this.showMenu}
          onClick={this.onClick}
          {...otherProps}
        />
        <div className={contentClass}>{this.renderMenu()}</div>
      </div>
    );
  }
}

/******************************************************************************/
