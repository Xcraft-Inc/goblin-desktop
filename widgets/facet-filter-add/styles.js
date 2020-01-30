/******************************************************************************/

export default function styles(theme) {
  const facetFilterAddButton = {
    'margin': '2px 0px',
    'padding': '0px 10px',
    'flexGrow': 1,
    'display': 'flex',
    'flexDirection': 'column',
    'borderRadius': '2px',
    'border': `1px solid ${theme.palette.textFieldBorderColor}`,
    'backgroundColor': theme.palette.facetBackground,
    ':hover': {
      backgroundColor: theme.palette.facetBackgroundHover,
    },
  };

  /******************************************************************************/

  return {
    facetFilterAddButton,
  };
}

/******************************************************************************/
