import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles(theme) {
  const desktopMonitors = {
    position: 'relative',
    height: theme.spacing.footerHeight,
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  };

  const look = {
    position: 'absolute',
    top: '0px',
    right: '0px',
  };

  /******************************************************************************/

  //---------\
  //  MODERN  >
  //---------/
  const desktopMonitorsModern = {
    zIndex: 20,
    position: 'absolute',
    right: '0px',
    bottom: theme.shapes.footerHeight,
    transitionProperty: 'bottom',
    transition: '0.3s ease-out',
  };

  const desktopMonitorsModernHidden = {
    ...desktopMonitorsModern,
    bottom: '-420px',
  };

  //--------\
  //  RETRO  >
  //--------/
  const desktopMonitorsRetro = {
    zIndex: 20,
    position: 'absolute',
    right: '10px',
    bottom: Unit.add(theme.shapes.footerHeight, '10px'),
    transition: '0.6s ease-out',
    transitionProperty: 'bottom',
    transitionTimingFunction: 'cubic-bezier(0.35, 1.5, 0.75, 1.0)',
  };

  const desktopMonitorsRetroHidden = {
    ...desktopMonitorsRetro,
    bottom: '-420px',
    transition: '0.7s ease-out',
    transitionTimingFunction: 'cubic-bezier(0.9, -0.7, 0.85, 0.4)',
  };

  /******************************************************************************/

  return {
    desktopMonitors,
    look,

    desktopMonitorsModern,
    desktopMonitorsModernHidden,
    desktopMonitorsRetro,
    desktopMonitorsRetroHidden,
  };
}

/******************************************************************************/
