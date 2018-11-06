/******************************************************************************/

export const propNames = ['width', 'column', 'flexGrow', 'columnsNo', 'margin'];

export function mapProps(props) {
  return {
    ...props,
    width: props.column.get('width'),
    flexGrow: props.column.get('width') ? '0' : '1',
    flexBasis: props.column.get('width') ? '0' : `${100 / props.columnsNo}%`,
    margin: props.margin ? props.margin : '10px',
  };
}

export default function styles(theme, props) {
  let {width, flexGrow, flexBasis, margin} = props;

  const item = {
    width: width,
    marginRight: '10px',
    marginTop: margin,
    marginBottom: margin,
    alignSelf: 'center',
    display: 'flex',
    flexGrow: flexGrow,
    flexBasis: flexBasis,
  };

  return {item};
}

/******************************************************************************/
