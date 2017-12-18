import {Unit} from 'electrum-theme';
import * as Bool from 'gadgets/boolean-helpers';

/******************************************************************************/

export default function styles (theme, props) {
  const formStyle = {
    height: '100%',
    display: 'flex',
  };

  const boardStyle = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  return {
    form: formStyle,
    board: boardStyle,
  };
}

/******************************************************************************/
