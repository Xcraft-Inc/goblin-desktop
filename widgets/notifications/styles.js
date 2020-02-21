import {Unit} from 'electrum-theme';

/******************************************************************************/

export const propNames = ['monitorLook'];

export default function styles(theme, props) {
  const {monitorLook = 'modern'} = props;

  let panel;
  let panelHidden;
  let header;
  let headerRow;
  let notifications;

  //---------\
  //  MODERN  >
  //---------/
  if (monitorLook === 'modern') {
    const m = theme.shapes.containerMargin;
    const s = theme.shapes.lineSpacing;
    const width = '400px';

    panel = {
      position: 'absolute',
      top: '0px',
      right: '0px',
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

    panelHidden = {
      ...panel,
      right: Unit.multiply(width, -1),
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

    notifications = {
      margin: '0px',
      backgroundColor: null,
      overflowY: 'auto',
    };
  }

  //--------\
  //  RETRO  >
  //--------/
  if (monitorLook === 'retro') {
    const m = theme.shapes.containerMargin;
    const s = theme.shapes.lineSpacing;
    const width = '460px';

    panel = {
      position: 'absolute',
      top: '10px',
      right: '10px',
      overflowY: 'hidden',
      maxHeight: '100%',
      width: width,
      display: 'flex',
      flexDirection: 'column',
      margin: '0px',
      borderRadius: '20px',
      backgroundColor: '#222',
      boxShadow: '0px 0px 50px black',
      zIndex: '5',
      transition: '0.6s ease-out',
      transitionProperty: 'right',
      transitionTimingFunction: 'cubic-bezier(0.35, 1.5, 0.75, 1.0)',
    };

    panelHidden = {
      ...panel,
      right: Unit.multiply(Unit.add(width, '10px'), -1),
      transition: '0.7s ease-out',
      transitionTimingFunction: 'cubic-bezier(0.9, -0.7, 0.85, 0.4)',
    };

    header = {
      display: 'inline',
      flexGrow: '1',
      padding: Unit.multiply(m, 0.5) + ' ' + m,
      margin: '0px 0px ' + s + ' 0px',
      borderRadius: '20px',
      borderTop: '10px solid #666',
      borderBottom: '10px solid #ccc',
      borderLeft: '10px solid #888',
      borderRight: '10px solid #aaa',
      //? background: 'linear-gradient(-180deg, black -70%, #555)',
      background: 'linear-gradient(170deg, #111 0%, #555)',
      color: '#999',
    };

    headerRow = {
      minHeight: '32px',
      display: 'flex',
      flexDirection: 'row',
    };

    notifications = {
      margin: '0px',
      padding: '0px 10px',
      backgroundColor: '#888',
      overflowY: 'auto',
      borderRadius: '20px',
      border: '2px solid #ddd',
    };
  }

  /******************************************************************************/

  return {
    panel,
    panelHidden,
    header,
    headerRow,
    notifications,
  };
}

/******************************************************************************/
