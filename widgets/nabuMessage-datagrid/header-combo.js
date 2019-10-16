//T:2019-02-27
import React from 'react';
import Widget from 'laboratory/widget';

import TextFieldCombo from 'gadgets/text-field-combo/widget';
import C from 'goblin-laboratory/widgets/connect-helpers/c';

const {GlyphHelpers} = require('goblin-toolbox');

class HeaderCombo extends Widget {
  render() {
    const {locales, index, hasTranslation, doAsDatagrid} = this.props;
    const localesList = locales
      .map(l => {
        const localName = l.get('name');
        return {
          id: localName,
          text: localName,
          glyph:
            hasTranslation && hasTranslation.get(`${localName}`)
              ? GlyphHelpers.getComboGlyph('desk', 'warning')
              : '',
        };
      })
      .toJS();

    return (
      <TextFieldCombo
        selectedId={C(`.columns[${index}].field`)}
        readonly="true"
        grow="1"
        list={localesList}
        menuType="wrap"
        comboTextTransform="none"
        onChange={locale => {
          doAsDatagrid('changeSelectedLocale', {index, locale});
        }}
        onShowCombo={() => {
          doAsDatagrid('setNeedTranslation');
        }}
        width={this.props.width}
      />
    );
  }
}

export default Widget.connect((state, props) => {
  return {
    locales: state.get(`backend.nabu.locales`),
    hasTranslation: state.get(`backend.${props.id}`).get('hasTranslations'),
  };
})(HeaderCombo);
