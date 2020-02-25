import {Unit} from 'electrum-theme';

/******************************************************************************/

export const propNames = ['monitorShowed'];

export default function styles(theme, props) {
  const {monitorShowed} = props;

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
      transition: monitorShowed
        ? theme.transitions.retroOpenTransition
        : theme.transitions.retroCloseTransition,
      transitionTimingFunction: monitorShowed
        ? theme.transitions.retroOpenFunction
        : theme.transitions.retroCloseFunction,
    };
  }

  /******************************************************************************/

  return {
    desktopMonitors,
    monitor,
  };
}

/******************************************************************************/
