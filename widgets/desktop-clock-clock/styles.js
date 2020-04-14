import {Unit} from 'electrum-theme';

/******************************************************************************/

function px(value) {
  return value + 'px';
}

/******************************************************************************/

export const propNames = ['size', 'showClock'];

export default function styles(theme, props) {
  const {size, showClock} = props;

  const s = Unit.parse(size).value;

  const bh = Unit.parse(theme.shapes.footerHeight).value;
  const bw = theme.look.name === 'retro' ? 65 * 2 : bh * 3;

  const cx = showClock ? 20 + s / 2 : bw / 2;
  const cy = showClock ? bh + 20 + s / 2 : bh / 2;

  const scale = showClock
    ? 1
    : theme.look.name === 'retro'
    ? 50 / s
    : (bh - 20) / s;

  const desktopClockClock = {
    position: 'fixed',
    width: px(s),
    height: px(s),
    right: px(cx - s / 2),
    bottom: px(cy - s / 2),
    transform: `scale(${scale})`,
    transition: '1.0s ease-out',
  };

  /******************************************************************************/

  return {
    desktopClockClock,
  };
}

/******************************************************************************/
