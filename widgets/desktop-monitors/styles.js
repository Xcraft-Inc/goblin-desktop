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
  let monitorPanel;
  let monitorPanelContent;
  let monitorSajex;

  //---------\
  //  MODERN  >
  //---------/
  if (look === 'modern') {
    monitorShowed = {
      zIndex: 20,
      position: 'fixed',
      right: '0px',
      bottom: theme.shapes.footerHeight,
      transitionProperty: 'bottom',
      transition: '0.3s ease-out',
    };

    monitorHidden = {
      ...monitorShowed,
      bottom: '-500px',
    };
  }

  //--------\
  //  RETRO  >
  //--------/
  if (look === 'retro') {
    monitorShowed = {
      zIndex: 20,
      position: 'fixed',
      right: '10px',
      bottom: Unit.add(theme.shapes.footerHeight, '10px'),
      transitionProperty: 'bottom',
      transition: theme.transitions.retroOpenTransition,
      transitionTimingFunction: theme.transitions.retroOpenFunction,
    };

    monitorHidden = {
      ...monitorShowed,
      bottom: '-500px',
      transition: theme.transitions.retroCloseTransition,
      transitionTimingFunction: theme.transitions.retroCloseFunction,
    };

    monitorPanel = {
      position: 'relative',
      width: '180px',
      height: '60px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    };

    monitorPanelContent = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    };

    monitorSajex = {
      width: '10px',
    };
  }

  /******************************************************************************/

  return {
    desktopMonitors,
    monitorShowed,
    monitorHidden,
    monitorPanel,
    monitorPanelContent,
    monitorSajex,
  };
}

/******************************************************************************/
