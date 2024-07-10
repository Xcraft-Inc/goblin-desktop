import {Unit} from 'goblin-theme';
const to = Unit.to;

/******************************************************************************/

export const propNames = ['cssUnit'];

export default function styles(theme, props) {
  let {cssUnit = 'px'} = props;
  const desktopScale = {};

  const dialog = {
    zIndex: 20,
    position: 'fixed',
    top: to(10, cssUnit),
    right: to(10, cssUnit),
    padding:
      `${to(20, cssUnit)} ${to(45, cssUnit)} ` +
      `${to(20, cssUnit)} ${to(20, cssUnit)}`,
    borderRadius: to(10, cssUnit),
    color: theme.palette.textColor,
    backgroundColor: theme.palette.flyingDialogBackground,
    boxShadow:
      `rgba(0, 0, 0, 1) ` +
      `${to(0, cssUnit)} ${to(0, cssUnit)} ` +
      `${to(40, cssUnit)} ${to(15, cssUnit)}`,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    transformOrigin: 'top right',
    fontSize: to(16, cssUnit),
  };

  const close = {
    position: 'fixed',
    right: to(15, cssUnit),
    top: to(15, cssUnit),
  };

  /******************************************************************************/

  return {
    desktopScale,
    dialog,
    close,
  };
}

/******************************************************************************/
