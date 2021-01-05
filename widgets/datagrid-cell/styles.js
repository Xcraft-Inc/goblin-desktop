/******************************************************************************/

export const propNames = [
  'width',
  'column',
  'flexGrow',
  'margin',
  'marginLeft',
  'marginRight',
  'flexShrink',
];

export function mapProps(props) {
  return {
    ...props,
    width: props.column.get('width'),
    flexGrow: props.column.get('width')
      ? null
      : props.column.get('grow') || '1',
    flexBasis: props.column.get('width') ? null : '0',
    flexShrink: props.column.get('width') ? null : '0',
    margin: props.margin ? props.margin : '0',
  };
}

export default function styles(theme, props) {
  let {
    width,
    flexGrow,
    flexShrink,
    flexBasis,
    margin,
    marginLeft,
    marginRight,
  } = props;

  const item = {
    width: width,
    marginLeft: marginLeft,
    marginRight: marginRight,
    marginTop: margin,
    marginBottom: margin,
    display: 'flex',
    flexGrow: flexGrow,
    flexShrink: flexShrink,
    flexBasis: flexBasis,
  };

  return {item};
}

/******************************************************************************/
