import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles(theme) {
  const look = theme.look.name;

  const desktopState = {
    position: 'relative',
    height: theme.shapes.footerHeight,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  };

  /******************************************************************************/

  let stateShowed;
  let stateHidden;

  //---------\
  //  MODERN  >
  //---------/
  if (look === 'modern') {
    stateShowed = {
      zIndex: 8,
      position: 'fixed',
      right: '10px',
      bottom: Unit.add(theme.shapes.footerHeight, '10px'),
      transitionProperty: 'bottom',
      transition: '0.3s ease-out',
    };

    stateHidden = {
      ...stateShowed,
      bottom: '-600px',
    };
  }

  //--------\
  //  RETRO  >
  //--------/
  if (look === 'retro') {
    stateShowed = {
      zIndex: 8,
      position: 'fixed',
      right: '10px',
      bottom: Unit.add(theme.shapes.footerHeight, '10px'),
      transitionProperty: 'bottom',
      transition: theme.transitions.retroOpenTransition,
      transitionTimingFunction: theme.transitions.retroOpenFunction,
    };

    stateHidden = {
      ...stateShowed,
      bottom: '-600px',
      transition: theme.transitions.retroCloseTransition,
      transitionTimingFunction: theme.transitions.retroCloseFunction,
    };
  }

  /******************************************************************************/

  return {
    desktopState,
    stateShowed,
    stateHidden,
  };
}

/******************************************************************************/
