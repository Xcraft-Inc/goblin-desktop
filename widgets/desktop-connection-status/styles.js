/******************************************************************************/

export default function styles(theme) {
  const dialog = {
    zIndex: 10,
    top: '80px',
    right: '20px',
    width: '400px',
    position: 'fixed',
    padding: '20px 20px 20px 20px',
    borderRadius: '10px',
    backgroundColor: theme.palette.flyingDialogBackground,
    boxShadow: 'rgba(0, 0, 0, 1) 0px 0px 40px 15px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'start',
    transformOrigin: 'top right',
  };

  const list = {
    display: 'flex',
    flexDirection: 'column',
  };

  const blink = {
    animationName: {
      '50%': {
        opacity: 0,
      },
    },
    animationDuration: '1.2s',
    animationIterationCount: 'infinite',
  };

  /******************************************************************************/

  return {
    dialog,
    list,
    blink,
  };
}

/******************************************************************************/
