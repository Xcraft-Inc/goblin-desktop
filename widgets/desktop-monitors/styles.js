/******************************************************************************/

export default function styles() {
  //--------\
  //  RETRO  >
  //--------/
  const desktopMonitorsRetro = {
    zIndex: 20,
    position: 'absolute',
    right: '10px',
    bottom: '10px',
    opacity: 1,
    transition: '0.6s ease-out',
    transitionTimingFunction: 'cubic-bezier(0.35, 1.5, 0.75, 1.0)',
  };

  const desktopMonitorsRetroHidden = {
    ...desktopMonitorsRetro,
    bottom: '-420px',
    opacity: 0,
    transition: '0.7s ease-out',
    transitionTimingFunction: 'cubic-bezier(0.9, -0.7, 0.85, 0.4)',
  };

  //---------\
  //  MODERN  >
  //---------/
  const desktopMonitorsModern = {
    zIndex: 20,
    position: 'absolute',
    right: '0px',
    bottom: '0px',
    opacity: 1,
    transition: '0.3s ease-out',
  };

  const desktopMonitorsModernHidden = {
    ...desktopMonitorsModern,
    bottom: '-420px',
    opacity: 0,
  };

  /******************************************************************************/

  return {
    desktopMonitorsRetro,
    desktopMonitorsRetroHidden,
    desktopMonitorsModern,
    desktopMonitorsModernHidden,
  };
}

/******************************************************************************/
