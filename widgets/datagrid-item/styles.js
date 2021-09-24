import {Unit} from 'goblin-theme';
const px = Unit.toPx;

/******************************************************************************/

export const propNames = ['height'];

export default function styles(theme, props) {
  const row = {
    minHeight: px(props.height),
    maxHeight: px(props.height),
  };

  return {row};
}
