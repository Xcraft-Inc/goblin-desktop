/******************************************************************************/

export const propNames = ['width', 'column', 'columnsNo'];

export function mapProps(props) {
  return {
    ...props,
    width: props.column.get('width') ? props.column.get('width') : `${15}vw`,
    //: `${100 / props.columnsNo}%`,
  };
}

export default function styles(theme, props) {
  let {width} = props;

  const item = {
    width: width,
    height: '60px',
    marginRight: '5px',
    alignSelf: 'center',
    display: 'flex',
  };

  return {item};
}

/******************************************************************************/
