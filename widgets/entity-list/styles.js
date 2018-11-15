/******************************************************************************/

export default function styles() {
  const full = {
    flexGrow: '1',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ccc',
  };
  const header = {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#ddd',
    flexGrow: '1',
  };

  const list = {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    overflowY: 'scroll',
  };

  return {
    full,
    header,
    list,
  };
}

/******************************************************************************/
