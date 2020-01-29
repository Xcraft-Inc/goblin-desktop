/******************************************************************************/

export default function styles(theme) {
  /******************************************************************************/
  const footer = {
    height: '50px',
    minHeight: '50px',
    padding: '0px 10px 0px 30px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '0px 0px 3px 3px',
    backgroundColor: theme.palette.paneNavigatorBackground,
  };

  const sajex = {
    flexGrow: 1,
  };

  return {footer, sajex};
}

/******************************************************************************/
