import {Unit} from 'goblin-theme';

/******************************************************************************/

export default function styles(theme) {
  const desktopScale = {};

  const dialog = {
    zIndex: 20,
    position: 'fixed',
    padding: '20px 45px 20px 20px',
    borderRadius: '10px',
    backgroundColor: theme.palette.flyingDialogBackground,
    boxShadow: 'rgba(0, 0, 0, 1) 0px 0px 40px 15px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    transformOrigin: 'top right',
  };

  const close = {
    position: 'fixed',
    right: '5px',
    top: '5px',
  };

  /******************************************************************************/

  return {
    desktopScale,
    dialog,
    close,
  };
}

/******************************************************************************/
