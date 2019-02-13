import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles(theme) {
  const m = theme.shapes.containerMargin;
  const s = theme.shapes.lineSpacing;
  const width = '400px';

  const panel = {
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

  const panelHidden = {
    ...panel,
    right: Unit.multiply(width, -1),
  };

  const header = {
    display: 'inline',
    flexGrow: '1',
    padding: Unit.multiply(m, 0.5) + ' ' + m,
    margin: '0px 0px ' + Unit.multiply(s, 0.4) + ' 0px',
    backgroundColor: theme.palette.notificationBackgroundHeader,
    color: theme.palette.notificationText,
  };

  const headerRow = {
    minHeight: '32px',
    display: 'flex',
    flexDirection: 'row',
  };

  const notifications = {
    margin: '0px',
    backgroundColor: null,
    overflowY: 'auto',
  };

  return {
    panel,
    panelHidden,
    header,
    headerRow,
    notifications,
  };
}

/******************************************************************************/
