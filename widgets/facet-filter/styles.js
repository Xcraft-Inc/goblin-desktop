/******************************************************************************/

export default function styles(theme) {
  const dialogContent = {
    position: 'absolute',
    top: '0px',
    bottom: '0px',
    left: '0px',
    right: '0px',
    display: 'flex',
    flexDirection: 'column',
  };

  const dialogHeader = {
    padding: '20px 40px 20px 40px',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: theme.palette.viewBackground,
  };

  const dialogButtons = {
    padding: '20px 40px 20px 40px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  };

  const dialogFooter = {
    padding: '20px 40px 20px 40px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.viewBackground,
  };

  const sajex = {
    flexGrow: 1,
  };

  return {
    dialogContent,
    dialogHeader,
    dialogButtons,
    dialogFooter,
    sajex,
  };
}

/******************************************************************************/
