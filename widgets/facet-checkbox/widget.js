import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Label from 'goblin-gadgets/widgets/label/widget';

/******************************************************************************/

class FacetCheckbox extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    const {checked, text, onChange, count} = this.props;
    const glyph = checked ? 'solid/check-square' : 'regular/square';

    return (
      <div className={this.styles.classNames.button} onClick={onChange}>
        <Label
          grow="1"
          height="20px"
          border="none"
          justify="left"
          wrap="no"
          text={text}
          glyph={glyph}
        />
        <Label text={count} />
      </div>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state, props) => {
  const checkbox = state
    .get(`backend.${props.id}.checkboxes.${props.name}`)
    ._state.get(props.value);
  if (!checkbox) {
    return {};
  }
  return {checked: checkbox.get('checked'), count: checkbox.get('count')};
})(FacetCheckbox);
