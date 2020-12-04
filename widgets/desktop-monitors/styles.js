import {Unit} from 'goblin-theme';

/******************************************************************************/

export default function styles(theme) {
  const look = theme.look.name;

  const desktopMonitors = {
    position: 'relative',
    height: theme.shapes.footerHeight,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  };

  /******************************************************************************/

  let monitorShowed;
  let monitorHidden;
  let monitorSajex;
  let monitorResizeButton;
  let monitorResizeGlyph;

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

    monitorResizeButton = {
      'position': 'absolute',
      'left': '0px',
      'top': '0px',
      'width': '30px',
      'height': '30px',
      'borderRadius': '15px',
      'display': 'flex',
      'justifyContent': 'center',
      'alignItems': 'center',
      'color': 'white',
      'backgroundColor': '#222',
      'transform': 'scale(0.5)',
      'transition': '0.3s ease-out',
      ':hover': {
        transform: 'scale(1.5)',
        backgroundColor: theme.palette.chrome,
      },
      ':hover .glyph-hover': {
        opacity: 1,
      },
    };

    monitorResizeGlyph = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0,
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

    monitorSajex = {
      width: '10px',
    };

    monitorResizeButton = {
      'position': 'absolute',
      'left': '-10px',
      'top': '-10px',
      'width': '30px',
      'height': '30px',
      'borderRadius': '30px',
      'borderTop': '3px solid transparent',
      'borderLeft': '3px solid transparent',
      'borderBottom': '3px solid transparent',
      'borderRight': '3px solid transparent',
      'display': 'flex',
      'justifyContent': 'center',
      'alignItems': 'center',
      'color': '#12a279',
      'boxShadow': '0px 0px 0px 0px transparent',
      'transition': theme.transitions.retroCloseTransition,
      'transitionTimingFunction': theme.transitions.retroCloseFunction,
      ':hover': {
        transform: 'scale(1.5)',
        borderTop: '3px solid #ccc',
        borderLeft: '3px solid #ccc',
        borderBottom: '3px solid #888',
        borderRight: '3px solid #888',
        backgroundColor: '#111',
        boxShadow: '5px 5px 15px 5px black',
        transition: theme.transitions.retroOpenTransition,
        transitionTimingFunction: theme.transitions.retroOpenFunction,
      },
      ':hover .glyph-hover': {
        opacity: 1,
        transform: 'rotate(180deg)',
      },
    };

    monitorResizeGlyph = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0,
      transition: '0.3s ease-out',
    };
  }

  /******************************************************************************/

  return {
    desktopMonitors,
    monitorShowed,
    monitorHidden,
    monitorSajex,
    monitorResizeButton,
    monitorResizeGlyph,
  };
}

/******************************************************************************/
