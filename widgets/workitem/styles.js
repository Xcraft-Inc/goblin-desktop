/******************************************************************************/

export default function styles() {
  const form = {
    height: '100%',
    display: 'flex',
  };

  const detail = {
    display: 'flex',
    flexGrow: 1,
  };

  const board = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const roadbook = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const desk = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  return {
    form,
    detail,
    board,
    roadbook,
    desk,
  };
}

/******************************************************************************/
