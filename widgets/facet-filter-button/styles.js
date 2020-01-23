/******************************************************************************/

export const propNames = ['active'];

export default function styles(theme, props) {
  const {active} = props;

  const facetFilterButton = {
    'margin': '2px 0px',
    'padding': '0px 10px',
    'flexGrow': 1,
    'display': 'flex',
    'flexDirection': 'column',
    'borderRadius': '2px',
    'border': `1px solid ${theme.palette.textFieldBorderColor}`,
    'backgroundColor': active
      ? theme.palette.facetBackgroundActive
      : theme.palette.facetBackground,
    ':hover': {
      backgroundColor: theme.palette.facetBackgroundHover,
    },
  };

  /******************************************************************************/

  const top = {
    height: '32px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  };

  const text = {
    flexGrow: 1,
    color: theme.palette.facetText,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  };

  const count = {
    marginRight: '10px',
    color: theme.palette.facetRange,
    fontSize: '80%',
  };

  /******************************************************************************/

  const bottom = {
    margin: '-5px 0px 5px 0px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  };

  /******************************************************************************/

  return {
    facetFilterButton,

    top,
    text,
    count,

    bottom,
  };
}

/******************************************************************************/
