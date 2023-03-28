/******************************************************************************/

export default function styles(theme) {
  const container = {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    padding: '10px 0px',
  };

  const containerTitle = {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
    padding: '5px 0px',
  };

  const listItem = {
    'margin': '1px 0px',
    'padding-left': '10px',
    'flexGrow': 1,
    'display': 'flex',
    'flexDirection': 'row',
    'borderRadius': '2px',
    'backgroundColor': theme.palette.light,
    ':hover': {
      backgroundColor: theme.palette.facetBackgroundHover,
    },
  };

  const listItemEdited = {
    ...listItem,
    'padding-left': '0px',
  };

  const listItemActive = {
    ...listItem,
    backgroundColor: theme.palette.facetBackgroundActive,
  };

  const buttons = {
    margin: '0px',
    padding: '10px 10px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '2px',
    backgroundColor: theme.palette.light,
  };

  const button = {
    'margin': '0px',
    'padding': '0px 10px',
    'flexGrow': 1,
    'display': 'flex',
    'flexDirection': 'row',
    'align-items': 'center',
    'borderRadius': '2px',
    'backgroundColor': theme.palette.light,
    ':hover': {
      backgroundColor: theme.palette.facetBackgroundHover,
    },
  };

  /******************************************************************************/

  return {
    container,
    containerTitle,
    listItem,
    listItemEdited,
    listItemActive,
    buttons,
    button,
  };
}

/******************************************************************************/
