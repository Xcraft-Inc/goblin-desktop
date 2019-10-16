//T:2019-02-27
import React from 'react';
import Widget from 'laboratory/widget';

import T from 't';
import Label from 'gadgets/label/widget';
import HeaderComboConnected from './header-combo';

// ------------------------------------------------------------

function renderMissingTranslationsHeaderCell() {
  return <div />;
}

function renderNabuIdHeaderCell() {
  return <Label horizontalSpacing="compact" text={T('Message original')} />;
}

function renderLocaleHeaderCell(id, index, doAsDatagrid) {
  return (
    <HeaderComboConnected id={id} index={index} doAsDatagrid={doAsDatagrid} />
  );
}

// ------------------------------------------------------------

function renderHeaderCell(props) {
  switch (props.column.get('name')) {
    case 'missingTranslations':
    case 'openExtern':
      return renderMissingTranslationsHeaderCell();
    case 'nabuId':
      return renderNabuIdHeaderCell();
    case 'locale_1':
    case 'locale_2':
      return renderLocaleHeaderCell(props.id, props.index, props.doAsDatagrid);
    default:
      return <div />;
  }
}

export default {renderHeaderCell: renderHeaderCell};
