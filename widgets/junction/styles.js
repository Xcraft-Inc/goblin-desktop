import {Unit} from 'goblin-theme';
const px = Unit.toPx;

/******************************************************************************/

export const propNames = ['w', 'h'];

export default function styles(theme, props) {
  const {w, h} = props;

  const junction = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: px(w),
    height: px(h),
  };

  return {junction};
}

/******************************************************************************/
