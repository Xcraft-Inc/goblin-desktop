/******************************************************************************/

export const propNames = ['width', 'height', 'place'];

export default function styles(theme, props) {
  const {width = '28px', height = '28px', place = 'middle'} = props;

  const p = '5px';
  const padding = {
    left: `0px 0px 0px ${p}`,
    middle: `0px ${p} 0px ${p}`,
    right: `0px ${p} 0px 0px`,
  }[place];

  const r = '14px';
  const borderRadius = {
    left: `${r} 0px 0px ${r}`,
    middle: '0px',
    right: `0px ${r} ${r} 0px`,
  }[place];

  const entityRowButton = {
    'width': width,
    'height': height,
    'marginRight': '1px',
    'padding': padding,
    'display': 'flex',
    'flexDirection': 'row',
    'justifyContent': 'center',
    'alignItems': 'center',
    'borderRadius': borderRadius,
    'fontSize': '90%',
    'color': theme.palette.tableSelectedText,
    'backgroundColor': theme.palette.tableSelectedBackground,
    ':hover': {
      backgroundColor: theme.palette.rootBackground,
    },
    'transition': '0.3s ease-out',
  };

  return {
    entityRowButton,
  };
}

/******************************************************************************/
