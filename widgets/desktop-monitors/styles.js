import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles(theme) {
  const look = theme.look.name;

  const desktopMonitors = {
    position: 'relative',
    height: theme.spacing.footerHeight,
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  };

  /******************************************************************************/

  let monitorShowed;
  let monitorHidden;

  //---------\
  //  MODERN  >
  //---------/
  if (look === 'modern') {
    monitorShowed = {
      zIndex: 20,
      position: 'absolute',
      right: '0px',
      bottom: theme.shapes.footerHeight,
      transitionProperty: 'bottom',
      transition: '0.3s ease-out',
    };

    monitorHidden = {
      ...monitorShowed,
      bottom: '-420px',
    };
  }

  //--------\
  //  RETRO  >
  //--------/
  if (look === 'retro') {
    monitorShowed = {
      zIndex: 20,
      position: 'absolute',
      right: '10px',
      bottom: Unit.add(theme.shapes.footerHeight, '10px'),
      transitionProperty: 'bottom',
      transition: theme.transitions.retroOpenTransition,
      transitionTimingFunction: theme.transitions.retroOpenFunction,
    };

    monitorHidden = {
      ...monitorShowed,
      bottom: '-420px',
      transition: theme.transitions.retroCloseTransition,
      transitionTimingFunction: theme.transitions.retroCloseFunction,
    };
  }

  /******************************************************************************/

  return {
    desktopMonitors,
    monitorShowed,
    monitorHidden,
  };
}

/******************************************************************************/
