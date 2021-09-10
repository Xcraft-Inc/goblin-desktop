/******************************************************************************/

export default function styles(theme) {
  const facetFilterAddButton = {
    'margin': '1px 0px',
    'padding': '0px 10px',
    'flexGrow': 1,
    'display': 'flex',
    'flexDirection': 'column',
    'borderRadius': '2px',
    'backgroundColor': theme.palette.light,
    ':hover': {
      backgroundColor: theme.palette.facetBackgroundHover,
    },
  };

  const facetFilterAddButtonActive = {
    ...facetFilterAddButton,
    backgroundColor: theme.palette.facetBackgroundActive,
  };

  /******************************************************************************/

  return {
    facetFilterAddButton,
    facetFilterAddButtonActive,
  };
}

/******************************************************************************/
