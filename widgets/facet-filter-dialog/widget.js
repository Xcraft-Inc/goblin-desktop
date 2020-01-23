import T from 't';
import React from 'react';
import Widget from 'laboratory/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import DialogModal from 'goblin-gadgets/widgets/dialog-modal/widget';
import Label from 'gadgets/label/widget';

/******************************************************************************/

function extractFirstLetter(text) {
  if (text && typeof text === 'string' && text.length > 0) {
    const letter = text[0];
    if (letter === ' ' || letter === '\t') {
      return '?';
    }
    return letter;
  }

  // TODO: If Nabu?

  return '?';
}

/******************************************************************************/

export default class FacetFilterDialog extends Widget {
  constructor() {
    super(...arguments);

    this.changeFacet = this.changeFacet.bind(this);
    this.clearAllFacets = this.clearAllFacets.bind(this);
    this.setAllFacets = this.setAllFacets.bind(this);
    this.toggleAllFacets = this.toggleAllFacets.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  onClose() {
    this.props.onClose();
  }

  _changeFacet(changed, newState) {
    const newValueList = [];
    for (const value of this.props.facets.values()) {
      const filter = value.get('key');
      if (changed === filter.toString()) {
        if (newState) {
          newValueList.push(filter);
        }
      } else {
        const isInList = this.props.filter.get('value').contains(filter);
        if (isInList) {
          newValueList.push(filter);
        }
      }
    }
    const searchId = this.props.id
      .split('@')
      .splice(1)
      .join('@');

    const value = this.getState()
      .widgets.get(searchId)
      .get('value');

    console.log(value);
    this.doAs('list', 'customize-visualization', {
      value,
      filter: {
        name: this.props.filter.get('name'),
        value: newValueList,
      },
    });
  }

  changeFacet(facet) {
    return () => {
      this._changeFacet(facet, !this.props.flags[facet].checked);
    };
  }

  clearAllFacets() {
    this.doAs('list', 'customize-visualization', {
      filter: {
        name: this.props.filter.get('name'),
        value: this.props.facets.map(f => f.get('key')).toArray(),
      },
    });
  }

  setAllFacets() {
    this.doAs('list', 'customize-visualization', {
      filter: {
        name: this.props.filter.get('name'),
        value: [],
      },
    });
  }

  toggleAllFacets() {
    const newValueList = [];
    for (const value of this.props.facets.values()) {
      const filter = value.get('key');
      if (!this.props.filter.get('value').contains(filter)) {
        newValueList.push(filter);
      }
    }
    this.doAs('list', 'customize-visualization', {
      filter: {
        name: this.props.filter.get('name'),
        value: newValueList,
      },
    });
  }

  /******************************************************************************/

  renderClose() {
    return null;
    //- return (
    //-   <div className={this.styles.classNames.closeButton}>
    //-     <Button
    //-       border="none"
    //-       glyph="solid/times"
    //-       glyphSize="120%"
    //-       height="32px"
    //-       width="32px"
    //-       onClick={this.onClose}
    //-     />
    //-   </div>
    //- );
  }

  renderLetter(letter, index) {
    return (
      <div key={index} className={this.styles.classNames.letter}>
        <Label fontSize="300%" disabled={true} text={letter} />
      </div>
    );
  }

  renderButton(row, index) {
    const glyph = row.checked ? 'solid/check-square' : 'regular/square';

    return (
      <div key={index} className={this.styles.classNames.button}>
        <Button
          grow="1"
          height="20px"
          border="none"
          justify="left"
          heightStrategy="compact"
          text={row.text}
          glyph={glyph}
          onClick={row.onChange}
        />
        <Label text={row.count} />
      </div>
    );
  }

  renderButtons(rows) {
    const result = [];
    let index = 0;

    if (rows.length < 20) {
      for (const row of rows) {
        result.push(this.renderButton(row, index++));
      }
    } else {
      let lastLetter = null;
      for (const row of rows) {
        const letter = extractFirstLetter(row.text);
        if (lastLetter !== letter) {
          lastLetter = letter;
          result.push(this.renderLetter(letter, index++));
        }

        result.push(this.renderButton(row, index++));
      }
    }

    return result;
  }

  renderFooter(enableClearAll, enableSetAll) {
    return (
      <div className={this.styles.classNames.footer}>
        {enableClearAll ? (
          <Button
            border="none"
            glyph={'regular/square'}
            text={T('Tout décocher')}
            onClick={this.clearAllFacets}
          />
        ) : null}
        {enableSetAll ? (
          <Button
            border="none"
            glyph={'solid/check-square'}
            text={T('Tout cocher')}
            onClick={this.setAllFacets}
          />
        ) : null}
        {enableClearAll && enableSetAll ? (
          <Button
            border="none"
            glyph={'solid/sync'}
            text={T('Tout inverser')}
            onClick={this.toggleAllFacets}
          />
        ) : null}
      </div>
    );
  }

  render() {
    const rows = [];
    let enableClearAll = false;
    let enableSetAll = false;
    for (const [key, flag] of Object.entries(this.props.flags)) {
      rows.push({
        text: key,
        count: flag.count,
        checked: !flag.checked,
        onChange: this.changeFacet(key),
      });
      if (flag.checked) {
        enableSetAll = true;
      } else {
        enableClearAll = true;
      }
    }

    const windowHeight = window.innerHeight;
    const r = this.props.parentButtonRect;
    const count = this.props.facets.size;
    const height = Math.min(count * 20 + 100, windowHeight - 20);
    let centerY = r.top + r.height / 2;

    let shiftY = 0;
    if (centerY - height / 2 < 10) {
      const offset = height / 2 - centerY + 10;
      centerY += offset;
      shiftY = -offset;
    }
    if (centerY + height / 2 > windowHeight - 10) {
      const offset = centerY + height / 2 - (windowHeight - 10);
      centerY -= offset;
      shiftY = offset;
    }

    return (
      <DialogModal
        width="480px"
        height={height + 'px'}
        left={r.right + 40 + 'px'}
        center={centerY + 'px'}
        triangleShift={shiftY + 'px'}
        close={this.onClose}
      >
        <div className={this.styles.classNames.facetFilterDialog}>
          <div className={this.styles.classNames.buttons}>
            <div className={this.styles.classNames.scrollable}>
              {this.renderButtons(rows)}
            </div>
          </div>
          {this.renderFooter(enableClearAll, enableSetAll)}
          {this.renderClose()}
        </div>
      </DialogModal>
    );
  }
}

/******************************************************************************/
