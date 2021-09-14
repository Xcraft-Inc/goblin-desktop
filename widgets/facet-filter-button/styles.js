/******************************************************************************/

export const propNames = ['active'];

export default function styles(theme, props) {
  const {active} = props;

  const facetFilterButton = {
    'margin': '1px 0px',
    'padding': '0px 10px',
    'flexGrow': 1,
    'display': 'flex',
    'flexDirection': 'column',
    'borderRadius': '2px',
    'backgroundColor': active
      ? theme.palette.facetBackgroundActive
      : theme.palette.light,
    'overflow': 'hidden',
    ':hover': {
      backgroundColor: theme.palette.facetBackgroundHover,
    },
  };

  const facetFilterButtonDisabled = {
    ...facetFilterButton,
    backgroundColor: theme.palette.textFieldBorderColor,
    opacity: 0.3,
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
    facetFilterButtonDisabled,

    top,
    text,
    count,

    bottom,
  };
}

/******************************************************************************/
