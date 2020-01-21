import {Unit} from 'electrum-theme';

/******************************************************************************/

export default function styles(theme) {
  const m = theme.shapes.containerMargin;

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

  const topButtons = {
    zIndex: 1,
    position: 'absolute',
    left: '0px',
    right: '0px',
    top: '-40px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: '0px',
    marginTop: Unit.multiply(Unit.add('50px', m), -1),
    backgroundColor: 'transparent',
  };

  const _warning = {
    height: '20px',
    flexDirection: 'row',
    flexGrow: 1,
    padding: Unit.multiply(m, 0.5) + ' ' + m,
    margin: Unit.multiply(m, -1) + ' 0px ' + m + ' 0px',
  };
  const warningDraft = {
    ..._warning,
    backgroundColor: theme.palette.markSuccess,
  };
  const warningArchived = {
    ..._warning,
    backgroundColor: theme.palette.markSecondary,
  };
  const warningTrashed = {
    ..._warning,
    backgroundColor: theme.palette.markPrimary,
  };
  const warningBusiness = {
    ..._warning,
    backgroundColor: theme.palette.markBase,
  };
  const warningDefault = {
    ..._warning,
    backgroundColor: theme.palette.paneHeaderBackground,
  };

  const warningButtons = {
    height: '40px',
    display: 'flex',
    flexDirection: 'row',
    margin: Unit.multiply(m, -1) + ' 0px ' + m + ' 0px',
    backgroundColor: theme.palette.rootBackground,
  };

  /******************************************************************************/

  return {
    form,
    detail,
    board,
    roadbook,
    desk,
    topButtons,
    warningDraft,
    warningArchived,
    warningTrashed,
    warningBusiness,
    warningDefault,
    warningButtons,
  };
}

/******************************************************************************/
