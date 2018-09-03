import React from 'react';
import Widget from 'laboratory/widget';
import importer from 'laboratory/importer/';
import HinterColumn from 'gadgets/hinter-column/widget';
import MouseTrap from 'mousetrap';
const widgetImporter = importer('widget');

class Hinter extends Widget {
  constructor() {
    super(...arguments);

    this.onKeyUp = this.onKeyUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onValidate = this.onValidate.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      type: 'type',
      kind: 'kind',
      title: 'title',
      glyph: 'glyph',
      rows: 'rows',
      glyphs: 'glyphs',
      status: 'status',
      selectedIndex: 'selectedIndex',
      onNew: 'onNew',
      newButtonTitle: 'newButtonTitle',
    };
  }

  componentWillMount() {
    MouseTrap.bind('up', this.onKeyUp, 'keydown');
    MouseTrap.bind('down', this.onKeyDown, 'keydown');
    MouseTrap.bind('return', this.onValidate);
    MouseTrap.bind('tab', this.onValidate);
  }

  componentWillUnmount() {
    MouseTrap.unbind('up');
    MouseTrap.unbind('down');
    MouseTrap.unbind('return');
    MouseTrap.unbind('tab');
  }

  onValidate() {
    this.validateRow(parseInt(this.props.selectedIndex));
  }

  onKeyUp() {
    this.selectRow(parseInt(this.props.selectedIndex) - 1);
  }

  onKeyDown() {
    this.selectRow(parseInt(this.props.selectedIndex) + 1);
  }

  selectRow(index) {
    if (index >= 0 && index < this.props.rows.size) {
      const value = this.props.rows.get(index);
      this.do('select-row', {index, value});
    }
  }

  validateRow(index) {
    if (index >= 0 && index < this.props.rows.size) {
      const value = this.props.rows.get(index);
      const model = this.getRouting()
        .get('location.hash')
        .substring(1);
      this.do('validate-row', {index, text: value, model});
      this.hideHinter();
    }
  }

  render() {
    const {
      id,
      onNew,
      kind,
      title,
      glyph,
      rows,
      glyphs,
      status,
      selectedIndex,
      newButtonTitle,
    } = this.props;

    if (!id) {
      return null;
    }

    /* NOT USED
    const DedicatedWidget = widgetImporter (`${type}-hinter`);
    if (DedicatedWidget) {
      const wireDedicatedHinter = Widget.Wired (DedicatedWidget);
      const WiredDedicatedWidget = wireDedicatedHinter (id);
      return <WiredDedicatedWidget />;
    } else {*/

    return (
      <HinterColumn
        id={id}
        kind={kind}
        titleText={title}
        titleGlyph={glyph}
        rows={rows}
        glyphs={glyphs}
        status={status}
        selectedIndex={selectedIndex}
        newButtonTitle={newButtonTitle}
        onNew={() => {
          if (onNew) {
            const model = this.getRouting()
              .get('location.hash')
              .substring(1);
            const value = this.getModelValue(model, true);
            this.do('create-new', {value});
          }
        }}
        displayNewButton={onNew}
        onRowClick={index => {
          this.selectRow(index);
        }}
        onRowDbClick={index => {
          this.validateRow(index);
        }}
      />
    );
  }
}

export default Hinter;
