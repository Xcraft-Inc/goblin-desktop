import {Unit} from 'goblin-theme';
import {ColorHelpers} from 'goblin-theme';

/******************************************************************************/

export default function styles(theme) {
  const m = theme.shapes.containerMargin;

  const boxStyle = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Unit.multiply(m, 0.5),
    marginBottom: Unit.sub(Unit.multiply(m, -0.5), '1px'),
    marginLeft: Unit.multiply(m, -1),
    marginRight: Unit.multiply(m, -1),
    paddingTop: Unit.multiply(m, 0.5),
    paddingBottom: Unit.multiply(m, 0.5),
    paddingLeft: Unit.multiply(m, 0.5),
    paddingRight: Unit.multiply(m, 0.5),
    borderTop: '1px solid ' + theme.palette.paneNavigatorInactiveBorder,
    borderBottom: '1px solid ' + theme.palette.paneNavigatorInactiveBorder,
    boxSizing: 'border-box',
    transition: 'background-color 200ms cubic-bezier(0.42, 0, 0.58, 1) 0ms',
  };
  boxStyle[':hover'] = {
    backgroundColor: theme.palette.textFieldReadonlyBackground,
  };

  const boxActiveStyle = Object.assign({}, boxStyle); // clone
  boxActiveStyle.paddingLeft = Unit.sub(
    Unit.multiply(m, 0.5),
    theme.shapes.markWidth
  );
  boxActiveStyle.borderLeft =
    theme.shapes.markWidth +
    ' solid ' +
    ColorHelpers.getMarkColor(theme, 'base');

  const scaleAnimation = true;

  const infoVisibleStyle = {
    position: 'absolute',
    top: '5px',
    right: '5px',
    display: 'flex',
    flexDirection: 'row',
  };
  if (scaleAnimation) {
    infoVisibleStyle.transform = 'scaleY(1)';
    infoVisibleStyle.transition =
      'transform 200ms cubic-bezier(0.42, 0, 0.58, 1) 300ms';
  } else {
    infoVisibleStyle.opacity = 1;
    infoVisibleStyle.transition =
      'opacity 200ms cubic-bezier(0.42, 0, 0.58, 1) 300ms';
  }

  const infoHiddenStyle = Object.assign({}, infoVisibleStyle); // clone
  if (scaleAnimation) {
    infoHiddenStyle.transform = 'scaleY(0)';
    infoHiddenStyle.transition =
      'transform 100ms cubic-bezier(0.42, 0, 0.58, 1) 0ms';
  } else {
    infoHiddenStyle.opacity = 0;
    infoHiddenStyle.transition =
      'opacity 100ms cubic-bezier(0.42, 0, 0.58, 1) 0ms';
  }

  return {
    box: boxStyle,
    boxActive: boxActiveStyle,
    infoVisible: infoVisibleStyle,
    infoHidden: infoHiddenStyle,
  };
}

/******************************************************************************/
