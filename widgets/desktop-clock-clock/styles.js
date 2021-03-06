import {Unit} from 'goblin-theme';
const px = Unit.toPx;
const n = Unit.toValue;

/******************************************************************************/

export const propNames = ['size', 'showClock'];

export default function styles(theme, props) {
  const {size, showClock} = props;

  const s = n(size);

  const bh = n(theme.shapes.footerHeight);
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
    transition: '1s ease-out',
  };

  const desktopClockClockHidden = {
    ...desktopClockClock,
    right: px(-s * 0.9),
    transition: '0.3s ease-out', // transition for hidden to bottom
  };

  const desktopClockClockFix = {
    ...desktopClockClock,
    pointerEvents: 'none',
  };

  /******************************************************************************/

  return {
    desktopClockClock,
    desktopClockClockHidden,
    desktopClockClockFix,
  };
}

/******************************************************************************/
