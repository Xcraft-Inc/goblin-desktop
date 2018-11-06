/******************************************************************************/

export const propNames = ['width', 'column', 'flexGrow', 'columnsNo'];

export function mapProps(props) {
  return {
    ...props,
    width: props.column.get('width'),
    flexGrow: props.column.get('width') ? '0' : '1',
    flexBasis: props.column.get('width') ? '0' : `${100 / props.columnsNo}%`,
  };
}

export default function styles(theme, props) {
  let {width, flexGrow, flexBasis} = props;

  const item = {
    width: width,
    height: '60px',
    marginRight: '10px',
    alignSelf: 'center',
    display: 'flex',
    flexGrow: flexGrow,
    flexBasis: flexBasis,
  };

  return {item};
}

/******************************************************************************/
