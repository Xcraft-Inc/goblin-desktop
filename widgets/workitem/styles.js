import {Unit, ColorManipulator} from 'goblin-theme';

/******************************************************************************/

export default function styles(theme) {
  const m = theme.shapes.containerMargin;
  const mm = Unit.multiply(m, 2);

  const form = {
    height: '100%',
    display: 'flex',
  };

  const detail = {
    height: '100%',
    display: 'flex',
    flexGrow: 1,
  };

  const board = {
    height: '100%',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const roadbook = {
    height: '100%',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const desk = {
    height: '100%',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  /******************************************************************************/

  const status = {
    position: 'relative',
    margin: Unit.multiply(m, -1) + ' 0px ' + m + ' 0px',
    minHeight: '40px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: theme.palette.rootBackground,
  };

  const topButtons = {
    zIndex: 1,
    position: 'absolute',
    left: '0px',
    right: '0px',
    top: Unit.multiply(Unit.add('50px', mm), -1),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: '0px',
    backgroundColor: 'transparent',
  };

  const _status = {
    height: '20px',
    flexDirection: 'row',
    flexGrow: 1,
    padding: Unit.multiply(m, 0.5) + ' ' + m,
  };
  const statusDraft = {
    ..._status,
    backgroundColor: theme.palette.markSuccess,
  };
  const statusArchived = {
    ..._status,
    backgroundColor: theme.palette.markSecondary,
  };
  const statusTrashed = {
    ..._status,
    backgroundColor: theme.palette.markPrimary,
  };
  const statusBusiness = {
    ..._status,
    backgroundColor: theme.palette.markBase,
  };
  const statusDefault = {
    ..._status,
    backgroundColor: theme.palette.paneHeaderBackground,
  };
  const statusEmpty = {
    ..._status,
    backgroundColor: theme.palette.rootBackground,
  };

  const statusButtons = {
    height: '40px',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: theme.palette.rootBackground,
  };

  /******************************************************************************/

  const deleteSup = {
    margin: '40px 40px 20px 40px',
    display: 'flex',
    flexDirection: 'column',
  };

  const deleteRadio = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  };

  const deleteInfArchive = {
    backgroundColor: ColorManipulator.lighten(theme.palette.base, 0.8),
    display: 'flex',
    flexDirection: 'column',
  };

  const deleteInfTrash = {
    ...deleteInfArchive,
    backgroundColor: '#ff000088',
  };

  const deleteInfUnknown = {
    ...deleteInfArchive,
    backgroundColor: null,
  };

  const deleteDescription = {
    margin: '20px 40px 30px 40px',
    height: '60px',
  };

  const deleteButtons = {
    margin: '0px 40px 40px 40px',
    display: 'flex',
    flexDirection: 'row',
  };

  /******************************************************************************/

  const actionsList = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '10px',
  };

  const actionList = {
    width: '300px',
    display: 'flex',
    flexDirection: 'row',
    margin: '0px 5px 2px 5px',
  };

  /******************************************************************************/

  return {
    form,
    detail,
    board,
    roadbook,
    desk,

    status,
    topButtons,
    statusDraft,
    statusArchived,
    statusTrashed,
    statusBusiness,
    statusDefault,
    statusEmpty,
    statusButtons,

    deleteSup,
    deleteInfArchive,
    deleteInfTrash,
    deleteInfUnknown,
    deleteRadio,
    deleteDescription,
    deleteButtons,

    actionsList,
    actionList,
  };
}

/******************************************************************************/
