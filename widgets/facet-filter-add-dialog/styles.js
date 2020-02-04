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
    backgroundColor: theme.palette.stateBrowserHeaderBackground,
  };

  const content = {
    flexGrow: 1,
    padding: '30px',
  };

  const item = {
    'height': '30px',
    'padding': '0px 10px',
    'display': 'flex',
    'flexDirection': 'row',
    'alignItems': 'center',
    'borderRadius': '3px',
    ':hover': {
      background: theme.palette.filterItemBackgroundHover,
    },
  };

  const itemSelected = {
    ...item,
    'color': theme.palette.filterItemSelected,
    'background': theme.palette.filterItemBackgroundSelected,
    ':hover': {
      background: theme.palette.filterItemBackgroundHoverSelected,
    },
  };

  const itemName = {
    flexGrow: 1,
  };

  const itemType = {
    fontSize: '80%',
    opacity: 0.6,
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

  /******************************************************************************/

  return {
    facetFilterDialogAdd,
    header,
    content,
    item,
    itemSelected,
    itemName,
    itemType,
    footer,
  };
}

/******************************************************************************/
