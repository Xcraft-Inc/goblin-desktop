import {Unit} from 'electrum-theme';
import {ColorManipulator} from 'electrum-theme';

/******************************************************************************/

export const propNames = ['right', 'bottom', 'looks'];

export default function styles(theme, props) {
  const {right, bottom, looks} = props;

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

  const size = '220px';
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
  const hs = '20px';
  const ht = Unit.multiply(hs, 2);

  const menuItem = {
    'width': size,
    'height': size,
    'margin': m,
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'backgroundColor': theme.palette.menuItemInactiveBackground,
    'transition': 'all 0.5s ease',
    ':hover': {
      background: `repeating-linear-gradient(-45deg, ${hc1}, ${hc1} ${hs}, ${hc2} 0px, ${hc2} ${ht})`,
      transform: 'scale(1.05)',
    },
  };

  const menuItemSelected = {
    ...menuItem,
    'backgroundColor': theme.palette.menuItemActiveBackground,
    ':hover': {
      background: `repeating-linear-gradient(-45deg, ${hc1}, ${hc1} ${hs}, ${hc2} 0px, ${hc2} ${ht})`,
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
