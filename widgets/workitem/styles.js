/******************************************************************************/

export default function styles() {
  const formStyle = {
    height: '100%',
    display: 'flex',
  };

  const detailStyle = {
    display: 'flex',
    flexGrow: 1,
  };

  const boardStyle = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const roadbookStyle = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const deskStyle = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  return {
    form: formStyle,
    detail: detailStyle,
    board: boardStyle,
    roadbook: roadbookStyle,
    desk: deskStyle,
  };
}

/******************************************************************************/
