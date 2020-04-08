import {Unit} from 'electrum-theme';
import {ColorManipulator} from 'electrum-theme';

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

  const buttonWidth =
    theme.look.name === 'retro'
      ? '400px'
      : Unit.add(theme.shapes.containerMargin, theme.shapes.footerHeight);

  const x = Unit.multiply(
    Unit.sub(buttonWidth, theme.look.clockParams.size),
    0.5
  );

  const clockShowed = {
    'position': 'absolute',
    'right': x,
    'bottom': Unit.add(theme.shapes.footerHeight, '20px'),
    'transformOrigin': 'bottom',
    'transition': 'all 0.5s ease',
    ':hover': {
      transform: 'scale(2)',
    },
  };

  const clockHidden = {
    ...clockShowed,
    'bottom': Unit.multiply(theme.look.clockParams.size, -1.1),
    ':hover': null,
  };

  const miniClock = {
    'width': theme.shapes.footerHeight,
    'height': theme.shapes.footerHeight,
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

  const miniClockRetroWith = {
    width: '36px',
    height: '36px',
    marginLeft: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '5px 5px 10px black',
    borderRadius: '18px',
    backgroundColor: '#888',
  };

  const miniClockRetroWithout = {
    width: '36px',
    height: '36px',
    marginLeft: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '5px 5px 10px black',
    borderRadius: '18px',
    backgroundColor: '#bbb',
    boxSizing: 'border-box',
    border: '3px solid #888',
  };

  /******************************************************************************/

  return {
    desktopClock,
    clockShowed,
    clockHidden,
    miniClock,
    miniClockRetroWith,
    miniClockRetroWithout,
  };
}

/******************************************************************************/
