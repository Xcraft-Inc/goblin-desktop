/******************************************************************************/

export default function styles(theme) {
  const button = {
    'minHeight': '20px',
    'maxHeight': '20px',
    'padding': '0px 0px 0px 10px',
    'display': 'flex',
    'flexDirection': 'row',
    ':hover': {
      background: theme.palette.facetBackgroundHover,
    },
  };
  return {button};
}

/******************************************************************************/
