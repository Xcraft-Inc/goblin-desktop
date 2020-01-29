/******************************************************************************/

export default function styles(theme) {
  const facetFilterDialogAdd = {
    position: 'absolute',
    top: '0px',
    bottom: '0px',
    left: '0px',
    right: '0px',
    display: 'flex',
    flexDirection: 'column',
  };

  const header = {
    height: '50px',
    minHeight: '50px',
    padding: '10px 30px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '0px 0px 3px 3px',
    backgroundColor: theme.palette.paneNavigatorBackground,
  };

  const content = {
    flexGrow: 1,
    padding: '30px',
  };

  const footer = {
    height: '50px',
    minHeight: '50px',
    padding: '10px 30px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '0px 0px 3px 3px',
    backgroundColor: theme.palette.paneNavigatorBackground,
  };

  return {
    facetFilterDialogAdd,
    header,
    content,
    footer,
  };
}

/******************************************************************************/
