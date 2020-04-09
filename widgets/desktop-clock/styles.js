import {Unit} from 'electrum-theme';
import {ColorManipulator} from 'electrum-theme';

/******************************************************************************/

function px(value) {
  return value + 'px';
}

/******************************************************************************/

export default function styles(theme) {
  const m = Unit.multiply(theme.shapes.containerMargin, 0.5);

  const desktopClock = {
    position: 'relative',
    height: theme.shapes.footerHeight,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  };

  /******************************************************************************/

  const s = Unit.parse(theme.look.clockParams.size).value;

  const bw = theme.look.name === 'retro' ? 65 * 2 : 84;
  const bh = Unit.parse(theme.shapes.footerHeight).value;

  const clockShowed = {
    position: 'fixed',
    width: px(s),
    height: px(s),
    borderRadius: px(s / 2),
    right: px(20),
    bottom: px(bh + 20),
    transition: 'all 0.5s ease',
  };

  const ss = theme.look.name === 'retro' ? 32 / s : (bh - 20) / s;
  const clockHidden = {
    ...clockShowed,
    right: px(-(s / 2 - bw / 2)),
    bottom: px(-(s / 2 - bh / 2)),
    transform: `scale(${ss})`,
  };

  const miniClock = {
    'width': theme.shapes.footerHeight,
    'height': theme.shapes.footerHeight,
    'marginRight': '1px',
    'paddingRight': m,
    'paddingLeft': m,
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    ':hover': {
      backgroundColor: ColorManipulator.emphasize(
        theme.palette.footerBackground,
        0.2
      ),
    },
  };

  const sajexRetro = {
    width: '16px',
  };

  /******************************************************************************/

  return {
    desktopClock,
    clockShowed,
    clockHidden,
    miniClock,
    sajexRetro,
  };
}

/******************************************************************************/
