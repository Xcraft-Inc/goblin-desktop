import {Unit, ColorManipulator} from 'goblin-theme';

/******************************************************************************/

export default function styles(theme) {
  const m = theme.shapes.containerMargin;
  const mm = Unit.multiply(m, 0.5);
  const mmm = Unit.multiply(m, 0.25);

  const entityAlerts = {
    position: 'relative',
    minHeight: '30px',
    margin: `${Unit.multiply(m, -1)} ${mm} ${mm} ${mm}`,
    display: 'flex',
    flexDirection: 'column',
    padding: '5px 0px',
    // backgroundColor: '#fff',
  };

  const _entityAlert = {
    display: 'flex',
    flexDirection: 'row',
    margin: `${mmm} ${mm}`,
    padding: `${mmm} ${m}`,
    borderRadius: '6px',
    boxShadow: '0px 1px 2px 0px #888',
  };

  const entityAlertCompacted = {
    ..._entityAlert,
    // background: 'linear-gradient(90deg, #fad7da, #fff2ce)',
    backgroundColor: ColorManipulator.emphasize(theme.palette.base, 0.5),
    color: theme.palette.actionBackground,
  };

  const entityAlertError = {
    ..._entityAlert,
    backgroundColor: '#fad7da',
    color: '#842431',
  };

  const entityAlertWarning = {
    ..._entityAlert,
    backgroundColor: '#fff2ce',
    color: '#90703c',
  };

  const button = {
    position: 'absolute',
    right: mm,
    top: mm,
    // color: '#842431',
  };

  /******************************************************************************/

  return {
    entityAlerts,
    entityAlertCompacted,
    entityAlertError,
    entityAlertWarning,
    button,
  };
}

/******************************************************************************/
