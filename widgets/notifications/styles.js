import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles(theme) {
  const m = theme.shapes.containerMargin;
  const s = theme.shapes.lineSpacing;

  //---------\
  //  MODERN  >
  //---------/
  const widthModern = '400px';

  const notificationsShowedModern = {
    position: 'absolute',
    top: '0px',
    right: '0px',
    overflowY: 'hidden',
    maxHeight: '100%',
    width: widthModern,
    display: 'flex',
    flexDirection: 'column',
    margin: '0px',
    backgroundColor: theme.palette.notificationBackground,
    transition: theme.transitions.easeOut(),
    zIndex: '5',
  };

  const notificationsHiddenModern = {
    ...notificationsShowedModern,
    right: Unit.multiply(widthModern, -1),
  };

  const headerModern = {
    display: 'inline',
    flexGrow: '1',
    padding: Unit.multiply(m, 0.5) + ' ' + m,
    margin: '0px 0px ' + Unit.multiply(s, 0.4) + ' 0px',
    backgroundColor: theme.palette.notificationBackgroundHeader,
    color: theme.palette.notificationText,
  };

  const headerRowModern = {
    minHeight: '32px',
    display: 'flex',
    flexDirection: 'row',
  };

  const notificationsModern = {
    margin: '0px',
    backgroundColor: null,
    overflowY: 'auto',
  };

  //--------\
  //  RETRO  >
  //--------/
  const widthRetro = '460px';

  const notificationsShowedRetro = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    overflowY: 'hidden',
    maxHeight: '100%',
    width: widthRetro,
    display: 'flex',
    flexDirection: 'column',
    margin: '0px',
    borderRadius: '20px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    boxShadow: '0px 0px 50px black',
    zIndex: '5',
    transitionProperty: 'right',
    transition: theme.transitions.retroOpenTransition,
    transitionTimingFunction: theme.transitions.retroOpenFunction,
  };

  const notificationsHiddenRetro = {
    ...notificationsShowedRetro,
    right: Unit.multiply(Unit.add(widthRetro, '10px'), -1),
    width: Unit.sub(widthRetro, '1px'), // fix mysterious bug with right screws at bad position!
    transition: theme.transitions.retroCloseTransition,
    transitionTimingFunction: theme.transitions.retroCloseFunction,
  };

  const headerRetro = {
    display: 'inline',
    flexGrow: '1',
    padding: Unit.multiply(m, 0.5) + ' ' + m,
    margin: '0px 0px ' + s + ' 0px',
    borderRadius: '20px',
    borderTop: '10px solid #666',
    borderBottom: '10px solid #ccc',
    borderLeft: '10px solid #888',
    borderRight: '10px solid #aaa',
    background: 'linear-gradient(170deg, #111 0%, #555)',
    color: '#999',
  };

  const headerRowRetro = {
    minHeight: '32px',
    display: 'flex',
    flexDirection: 'row',
  };

  const notificationsRetro = {
    position: 'relative',
    margin: '0px',
    padding: '0px',
    backgroundColor: '#888',
    overflowY: 'auto',
    borderRadius: '20px',
    border: '2px solid #ddd',
  };

  /******************************************************************************/

  const _screwMain = {
    position: 'absolute',
    width: '12px',
    height: '12px',
    borderRadius: '6px',
    border: '1px solid #333',
    backgroundColor: '#777',
    boxShadow: '1px 2px 5px 1px #555',
  };
  const screwMainTopLeft = {
    ..._screwMain,
    top: '8px',
    left: '8px',
  };
  const screwMainTopRight = {
    ..._screwMain,
    top: '8px',
    right: '8px',
  };
  const screwMainBottomLeft = {
    ..._screwMain,
    bottom: '8px',
    left: '8px',
  };
  const screwMainBottomRight = {
    ..._screwMain,
    bottom: '8px',
    right: '8px',
  };

  const _screwSlot = {
    position: 'absolute',
    width: '12px',
    height: '3px',
    margin: '4.5px 0px',
    border: '1px solid #333',
    backgroundColor: '#666',
  };
  const screwSlotTopLeft = {
    ..._screwSlot,
    top: '8px',
    left: '8px',
    transform: 'rotate(45deg)',
  };
  const screwSlotTopRight = {
    ..._screwSlot,
    top: '8px',
    right: '8px',
    transform: 'rotate(-20deg)',
  };
  const screwSlotBottomLeft = {
    ..._screwSlot,
    bottom: '8px',
    left: '8px',
    transform: 'rotate(70deg)',
  };
  const screwSlotBottomRight = {
    ..._screwSlot,
    bottom: '8px',
    right: '8px',
    transform: 'rotate(0deg)',
  };

  /******************************************************************************/

  return {
    notificationsShowedModern,
    notificationsHiddenModern,
    headerModern,
    headerRowModern,
    notificationsModern,

    notificationsShowedRetro,
    notificationsHiddenRetro,
    headerRetro,
    headerRowRetro,
    notificationsRetro,

    screwMainTopLeft,
    screwMainTopRight,
    screwMainBottomLeft,
    screwMainBottomRight,
    screwSlotTopLeft,
    screwSlotTopRight,
    screwSlotBottomLeft,
    screwSlotBottomRight,
  };
}

/******************************************************************************/
