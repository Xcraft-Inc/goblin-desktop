/******************************************************************************/

export default function styles() {
  const full = {
    margin: '0px',
    padding: '0px',
    overflowX: 'hidden',
    overflowY: 'hidden',
    flexGrow: '1',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
  };

  const toolbar = {
    margin: '20px',
  };

  const list = {
    width: '100%',
    height: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
  };

  const content = {
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
  };

  const header = {
    minHeight: '24px',
    padding: '0px 36px 0px 16px',
    borderBottom: '1px solid #888',
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
  };

  const rows = {
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
  };

  return {
    full,
    toolbar,
    list,
    content,
    header,
    rows,
  };
}

/******************************************************************************/
