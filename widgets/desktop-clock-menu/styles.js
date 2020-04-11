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

  const size = '250px';

  const fullScreen = {
    visibility: 'visible',
    position: 'fixed',
    zIndex: 11,
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
    width: Unit.multiply(size, nx),
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#222',
    boxShadow: '0px 0px 200px 50px black',
  };

  const menuItem = {
    'width': size,
    'height': size,
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'backgroundColor': theme.palette.menuItemInactiveBackground,
    'transition': 'all 0.5s ease',
    ':hover': {
      backgroundColor: ColorManipulator.emphasize(
        theme.palette.menuItemInactiveBackground,
        0.1
      ),
    },
  };

  const menuItemSelected = {
    ...menuItem,
    'backgroundColor': theme.palette.menuItemActiveBackground,
    ':hover': {
      backgroundColor: ColorManipulator.emphasize(
        theme.palette.menuItemActiveBackground,
        0.1
      ),
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
