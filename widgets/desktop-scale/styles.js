import {Unit} from 'goblin-theme';

/******************************************************************************/

export default function styles(theme) {
  const desktopScale = {};

  const dialog = {
    zIndex: 20,
    position: 'fixed',
    right: '0px',
    top: '0px',
    padding: '20px 0px 20px 20px',
    backgroundColor: theme.palette.flyingDialogBackground,
    boxShadow: theme.shapes.floatingShadow,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  };

  /******************************************************************************/

  return {
    desktopScale,
    dialog,
  };
}

/******************************************************************************/
