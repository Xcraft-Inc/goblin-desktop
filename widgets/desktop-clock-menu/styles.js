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

  const size = Unit.multiply(clockSize, 1.3);
  const m = '10px';

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

  const desktopClockMenu = {
    position: 'absolute',
    right: right,
    bottom: bottom,
    padding: m,
    width: Unit.multiply(size, nx),
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.palette.menuItemInactiveBackground,
    boxShadow: '0px 0px 200px 50px black',
  };

  // Use + for dispatch the style to next brother (only one).
  // Use ~ for dispatch the style to all the following brothers.
  // Use nothing for dispatch the style to children.
  const menuItem = {
    'position': 'relative',
    'width': size,
    'height': size,
    'backgroundColor': theme.palette.menuItemInactiveBackground,
    ':hover .background-hover': {
      opacity: 1,
    },
    ':hover .clock-hover': {
      transform: 'scale(1.05)',
    },
  };

  const menuItemSelected = {
    ...menuItem,
    backgroundColor: theme.palette.menuItemActiveBackground,
  };

  const hc1 = ColorManipulator.emphasize(
    theme.palette.menuItemInactiveBackground,
    0.1
  );
  const hc2 = ColorManipulator.emphasize(
    theme.palette.menuItemInactiveBackground,
    0.3
  );

  const background = {
    position: 'absolute',
    left: '0px',
    right: '0px',
    top: '0px',
    bottom: '0px',
    background: getHatching('20px', hc1, hc2),
    opacity: 0,
    transition: 'all 1.2s ease',
  };

  const clock = {
    position: 'absolute',
    left: '0px',
    right: '0px',
    top: '0px',
    bottom: '0px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.5s ease',
  };

  /******************************************************************************/

  return {
    fullScreen,
    desktopClockMenu,

    menuItem,
    menuItemSelected,
    background,
    clock,
  };
}

/******************************************************************************/
