/******************************************************************************/

export const propNames = ['active'];

export default function styles(theme, props) {
  const {active} = props;

  const facetFilterButton = {
    'height': '32px',
    'padding': '0px 10px',
    'flexGrow': 1,
    'display': 'flex',
    'flexDirection': 'row',
    'alignItems': 'center',
    'backgroundColor': active
      ? theme.palette.facetBackgroundActive
      : theme.palette.facetBackground,
    'borderRadius': '16px',
    ':hover': {
      backgroundColor: theme.palette.facetBackgroundHover,
    },
  };

  const text = {
    color: theme.palette.facetText,
    flexGrow: 1,
  };

  const count = {
    marginRight: '10px',
    color: theme.palette.facetRange,
    fontSize: '80%',
  };

  return {
    facetFilterButton,
    text,
    count,
  };
}

/******************************************************************************/
