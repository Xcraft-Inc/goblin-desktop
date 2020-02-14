/******************************************************************************/

export default function styles() {
  const desktopMonitors = {
    zIndex: 20,
    position: 'absolute',
    right: '10px',
    bottom: '10px',
    transition: '0.6s ease-out',
    transitionTimingFunction: 'cubic-bezier(0.35, 1.5, 0.75, 1.0)',
  };

  const desktopMonitorsHidden = {
    ...desktopMonitors,
    bottom: '-420px',
    transition: '0.7s ease-out',
    transitionTimingFunction: 'cubic-bezier(0.9, -0.7, 0.85, 0.4)',
  };

  return {
    desktopMonitors,
    desktopMonitorsHidden,
  };
}

/******************************************************************************/
