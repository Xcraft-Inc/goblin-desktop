import {Unit} from 'electrum-theme';
import {ColorManipulator} from 'electrum-theme';

/******************************************************************************/

export default function styles(theme) {
  const desktopClock = {
    position: 'relative',
    height: theme.shapes.footerHeight,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  };

  /******************************************************************************/

  const simpleButton = {
    'width': theme.shapes.footerHeight,
    'height': theme.shapes.footerHeight,
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'fontSize': '120%',
    'color': ColorManipulator.emphasize(theme.palette.footerBackground, 0.9),
    'backgroundColor': theme.palette.footerBackground,
    'transition': 'all 0.3s ease',
    ':hover': {
      backgroundColor: ColorManipulator.emphasize(
        theme.palette.footerBackground,
        0.2
      ),
    },
  };

  const tripleButton = {
    ...simpleButton,
    width: Unit.multiply(theme.shapes.footerHeight, 3),
  };

  const tripleButtonHover = {
    ...tripleButton,
    backgroundColor: ColorManipulator.emphasize(
      theme.palette.footerBackground,
      0.2
    ),
  };

  const sajexRetro = {
    width: '16px',
  };

  /******************************************************************************/

  return {
    desktopClock,
    simpleButton,
    tripleButton,
    tripleButtonHover,
    sajexRetro,
  };
}

/******************************************************************************/
