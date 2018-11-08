/******************************************************************************/

export const propNames = [
  'width',
  'column',
  'flexGrow',
  'margin',
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
    margin: props.margin ? props.margin : '10px',
  };
}

export default function styles(theme, props) {
  let {width, flexGrow, flexShrink, flexBasis, margin} = props;

  const item = {
    width: width,
    marginRight: '10px',
    marginTop: margin,
    marginBottom: margin,
    alignSelf: 'center',
    display: 'flex',
    flexGrow: flexGrow,
    flexShrink: flexShrink,
    flexBasis: flexBasis,
  };

  return {item};
}

/******************************************************************************/
