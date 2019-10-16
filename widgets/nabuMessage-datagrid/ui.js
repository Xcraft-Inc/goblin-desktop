//T:2019-02-27
import React from 'react';

import LabelTextField from 'gadgets/label-text-field/widget';

import T from 't';
import {SortLabel} from './labels';
import header from './header';
import row from './row';

// ------------------------------------------------------------

const tooltips = {
  asc: T('ascending order'),
  desc: T('descending order'),
};

function renderLocaleSortCell(doAsDatagrid, column, datagridId) {
  return (
    <SortLabel
      tooltips={tooltips}
      datagridId={datagridId}
      column={column}
      onClick={() =>
        doAsDatagrid('applyElasticVisualization', {
          sort: column.get('field'),
        })
      }
      horizontalSpacing="compact"
    />
  );
}

function renderHinterRow(doAsDatagrid) {
  return (
    <LabelTextField
      model=".searchValue"
      grow="1"
      labelGlyph="solid/search"
      onChange={value => doAsDatagrid('applyElasticVisualization', {value})}
      hintText={T('Search message or translation')}
      width="95%"
      verticalSpacing="5px"
      customMarginLeft="20px"
    />
  );
}
// ------------------------------------------------------------

function renderHinter(props) {
  return renderHinterRow(props.doAsDatagrid);
}

function renderSortCell(props) {
  switch (props.column.get('name')) {
    case 'nabuId':
    case 'locale_1':
    case 'locale_2':
      return renderLocaleSortCell(
        props.doAsDatagrid,
        props.column,
        props.datagridId
      );
    default:
      return <div />;
  }
}

/******************************************************************************/
export default {
  headerCell: header.renderHeaderCell,
  rowCell: row.renderRowCell,
  sortCell: renderSortCell,
  hinter: renderHinter,
};
