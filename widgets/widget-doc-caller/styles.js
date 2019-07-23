/******************************************************************************/

export default function styles(theme) {
  const fullScreen = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 10,
    display: 'flex',
    backgroundColor: theme.palette.rootBackground,
  };

  return {
    fullScreen,
  };
}

/******************************************************************************/
