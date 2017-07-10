import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles (theme, props) {
  const m = theme.shapes.containerMargin;
  const s = theme.shapes.lineSpacing;
  const width = '400px';

  const panelStyle = {
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
    transition: theme.transitions.easeOut (),
    zIndex: '5',
  };

  const panelHiddenStyle = {
    position: 'absolute',
    top: '0px',
    right: Unit.multiply (width, -1),
    overflowY: 'hidden',
    maxHeight: '100%',
    width: width,
    display: 'flex',
    flexDirection: 'column',
    margin: '0px',
    backgroundColor: theme.palette.notificationBackground,
    transition: theme.transitions.easeOut (),
    zIndex: '5',
  };

  const headerStyle = {
    display: 'inline',
    flexGrow: '1',
    padding: Unit.multiply (m, 0.5) + ' ' + m,
    margin: '0px 0px ' + Unit.multiply (s, 0.4) + ' 0px',
    backgroundColor: theme.palette.notificationBackgroundHeader,
    color: theme.palette.notificationText,
  };

  const headerRowStyle = {
    minHeight: '32px',
    display: 'flex',
    flexDirection: 'row',
  };

  const notificationsStyle = {
    margin: '0px',
    backgroundColor: null,
    overflowY: 'auto',
  };

  return {
    panel: panelStyle,
    panelHidden: panelHiddenStyle,
    header: headerStyle,
    headerRow: headerRowStyle,
    notifications: notificationsStyle,
  };
}

/******************************************************************************/
