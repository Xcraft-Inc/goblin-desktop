import {Unit} from 'electrum-theme';
import {ColorManipulator} from 'electrum-theme';

export const propNames = ['show'];

/******************************************************************************/

export default function styles(theme, props) {
  const {show} = props;
  const visible = show === 'true';
  const look = theme.look.name;

  const m = theme.shapes.containerMargin;
  const s = theme.shapes.lineSpacing;

  let notifications;
  let header;
  let headerRow;
  let panel;

  //---------\
  //  MODERN  >
  //---------/
  if (look === 'modern') {
    const width = '400px';

    notifications = {
      position: 'absolute',
      top: '0px',
      right: visible ? '0px' : Unit.multiply(width, -1),
      overflowY: 'hidden',
      maxHeight: '100%',
      width: width,
      display: 'flex',
      flexDirection: 'column',
      margin: '0px',
      backgroundColor: theme.palette.notificationBackground,
      transition: theme.transitions.easeOut(),
      zIndex: '5',
    };

    header = {
      display: 'inline',
      flexGrow: '1',
      padding: Unit.multiply(m, 0.5) + ' ' + m,
      margin: '0px 0px ' + Unit.multiply(s, 0.4) + ' 0px',
      backgroundColor: theme.palette.notificationBackgroundHeader,
      color: theme.palette.notificationText,
    };

    headerRow = {
      minHeight: '32px',
      display: 'flex',
      flexDirection: 'row',
    };

    panel = {
      margin: '0px',
      backgroundColor: null,
      overflowY: 'auto',
    };
  }

  //--------\
  //  RETRO  >
  //--------/
  if (look === 'retro') {
    const width = '460px';

    notifications = {
      position: 'absolute',
      top: '10px',
      right: visible ? '10px' : Unit.multiply(Unit.add(width, '30px'), -1),
      overflowY: 'hidden',
      maxHeight: '100%',
      width: visible ? width : Unit.sub(width, '1px'), // fix mysterious bug with right screws at bad position!
      display: 'flex',
      flexDirection: 'column',
      margin: '0px',
      borderRadius: '20px',
      backgroundColor: 'rgba(0,0,0,0.5)',
      //? boxShadow: '0px 0px 50px black',
      boxShadow: '0px 0px 80px 15px black',
      zIndex: '5',
      transitionProperty: 'right',
      transition: visible
        ? theme.transitions.retroOpenTransition
        : theme.transitions.retroCloseTransition,
      transitionTimingFunction: visible
        ? theme.transitions.retroOpenFunction
        : theme.transitions.retroCloseFunction,
    };

    header = {
      position: 'relative',
      display: 'inline',
      flexGrow: '1',
      padding: '15px 50px',
      margin: '0px 0px ' + s + ' 0px',
      borderRadius: '20px',
      borderTop: `10px solid ${ColorManipulator.lighten(
        theme.palette.actionButtonBackground,
        0.4
      )}`,
      borderBottom: `10px solid ${ColorManipulator.darken(
        theme.palette.actionButtonBackground,
        0.5
      )}`,
      borderLeft: `10px solid ${ColorManipulator.lighten(
        theme.palette.actionButtonBackground,
        0.2
      )}`,
      borderRight: `10px solid ${ColorManipulator.darken(
        theme.palette.actionButtonBackground,
        0.3
      )}`,
      background: 'linear-gradient(170deg, #111 0%, #555)',
      color: '#999',
    };

    headerRow = {
      minHeight: '32px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    };

    panel = {
      position: 'relative',
      margin: '0px',
      padding: '0px',
      backgroundColor: '#888',
      overflowY: 'auto',
      borderRadius: '20px',
      border: '2px solid #ddd',
    };
  }

  /******************************************************************************/

  return {
    notifications,
    header,
    headerRow,
    panel,
  };
}

/******************************************************************************/
