/******************************************************************************/

export default function styles(theme, props) {
  const even = {
    height: props.height,
    display: 'flex',
    flexDirection: 'row',
    padding: '5px 20px',
    backgroundColor: 'white',
    cursor: 'default',
  };

  const odd = {
    ...even,
    backgroundColor: '#eee',
  };

  return {
    even,
    odd,
  };
}

/******************************************************************************/
