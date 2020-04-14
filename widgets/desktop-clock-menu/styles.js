import {Unit} from 'electrum-theme';
import {ColorManipulator} from 'electrum-theme';

/******************************************************************************/

function getHatching(d, color1, color2) {
  const dd = Unit.multiply(d, 2);
  return `repeating-linear-gradient(-45deg, ${color1}, ${color1} ${d}, ${color2} 0px, ${color2} ${dd})`;
}

/******************************************************************************/

export const propNames = ['right', 'bottom', 'looks', 'clockSize'];

export default function styles(theme, props) {
  const {right, bottom, looks, clockSize} = props;

  const nx =
    {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 3,
      7: 4,
      8: 4,
      9: 5,
      10: 5,
      11: 5,
      12: 4,
    }[looks.length] || 5;

  const size = Unit.multiply(clockSize, 1.2);
  const m = '5px';

  const fullScreen = {
    visibility: 'visible',
    position: 'fixed',
    zIndex: 20,
    top: '0px',
    left: '0px',
    width: '100%',
    height: '100%',
    userSelect: 'none',
    cursor: 'default',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  };

  const menu = {
    position: 'absolute',
    right: right,
    bottom: bottom,
    padding: m,
    width: Unit.multiply(Unit.add(size, Unit.multiply(m, 2)), nx),
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.palette.menuItemInactiveBackground,
    boxShadow: '0px 0px 200px 50px black',
  };

  const hc1 = ColorManipulator.emphasize(
    theme.palette.menuItemInactiveBackground,
    0.1
  );
  const hc2 = ColorManipulator.emphasize(
    theme.palette.menuItemInactiveBackground,
    0.3
  );

  const menuItem = {
    'width': size,
    'height': size,
    'margin': m,
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    //'backgroundColor': theme.palette.menuItemInactiveBackground,
    'background': getHatching(
      '20px',
      theme.palette.menuItemInactiveBackground,
      theme.palette.menuItemInactiveBackground
    ),
    'transition': 'all 0.5s ease',
    ':hover': {
      background: getHatching('20px', hc1, hc2),
      transform: 'scale(1.05)',
    },
  };

  const menuItemSelected = {
    ...menuItem,
    'backgroundColor': theme.palette.menuItemActiveBackground,
    ':hover': {
      background: getHatching('20px', hc1, hc2),
      transform: 'scale(1.05)',
    },
  };

  /******************************************************************************/

  return {
    fullScreen,
    menu,
    menuItem,
    menuItemSelected,
  };
}

/******************************************************************************/
