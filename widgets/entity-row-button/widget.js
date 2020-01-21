import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import {TranslatableDiv} from 'nabu/helpers/element-helpers';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

/******************************************************************************/

export default class EntityRowButton extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    const parts = this.props.glyph.split('/');
    let prefix = '';
    let glyph = '';
    if (parts.length === 2) {
      // prefix:
      // 'solid'   -> 's' -> fas (standard)
      // 'regular' -> 'r' -> far (outline)
      // 'light'   -> 'l' -> fal
      // 'brands'  -> 'b' -> fab
      if (
        parts[0] !== 'solid' &&
        parts[0] !== 'regular' &&
        parts[0] !== 'light' &&
        parts[0] !== 'brands'
      ) {
        console.error(`Glyph '${parts[1]}' has unknown prefix '${parts[0]}'`);
      }
      prefix = parts[0][0]; // first letter
      glyph = parts[1];
    } else {
      console.warn(`Glyph '${glyph}' without prefix`);
    }

    return (
      <TranslatableDiv
        className={this.styles.classNames.entityRowButton}
        workitemId={this.context.desktopId || this.getNearestId()}
        title={this.props.tooltip}
        onClick={this.props.onClick}
      >
        <FontAwesomeIcon icon={[`fa${prefix}`, glyph]} />
      </TranslatableDiv>
    );
  }
}

/******************************************************************************/
