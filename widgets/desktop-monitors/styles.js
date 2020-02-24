import {Unit} from 'electrum-theme';

/******************************************************************************/

export const propNames = ['look', 'monitorShowed'];

export default function styles(theme, props) {
  const {look = 'modern', monitorShowed} = props;

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

  let monitor;

  //---------\
  //  MODERN  >
  //---------/
  if (look === 'modern') {
    monitor = {
      zIndex: 20,
      position: 'absolute',
      right: '0px',
      bottom: monitorShowed ? theme.shapes.footerHeight : '-420px',
      transitionProperty: 'bottom',
      transition: '0.3s ease-out',
    };
  }

  //--------\
  //  RETRO  >
  //--------/
  if (look === 'retro') {
    monitor = {
      zIndex: 20,
      position: 'absolute',
      right: '10px',
      bottom: monitorShowed
        ? Unit.add(theme.shapes.footerHeight, '10px')
        : '-420px',
      transitionProperty: 'bottom',
      transition: theme.transitions.retroOpenTransition,
      transitionTimingFunction: theme.transitions.retroOpenFunction,
    };
  }

  /******************************************************************************/

  return {
    desktopMonitors,
    monitor,
  };
}

/******************************************************************************/
