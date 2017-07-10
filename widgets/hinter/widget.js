import React from 'react';
import Widget from 'laboratory/widget';
import importer from 'laboratory/importer/';
import HinterColumn from 'gadgets/hinter-column/widget';
import MouseTrap from 'mousetrap';
const widgetImporter = importer ('widget');

class Hinter extends Widget {
  constructor (props) {
    super (props);
  }

  static get wiring () {
    return {
      id: 'id',
      type: 'type',
      kind: 'kind',
      title: 'title',
      glyph: 'glyph',
      rows: 'rows',
      selectedIndex: 'selectedIndex',
    };
  }

  componentWillMount () {
    MouseTrap.bind ('up', ::this.onKeyUp);
    MouseTrap.bind ('down', ::this.onKeyDown);
  }

  componentWillUnmount () {
    MouseTrap.unbind ('up');
    MouseTrap.unbind ('down');
  }

  onKeyUp () {
    this.selectRow (parseInt (this.props.selectedIndex) - 1);
  }

  onKeyDown () {
    this.selectRow (parseInt (this.props.selectedIndex) + 1);
  }

  selectRow (index) {
    if (index >= 0 && index < this.props.rows.size) {
      const value = this.props.rows.get (index);
      this.do ('select-row', {index, value});
    }
  }

  render () {
    const {id, type, kind, title, glyph, rows, selectedIndex} = this.props;
    console.log (selectedIndex);
    if (!id) {
      return null;
    }

    const DedicatedWidget = widgetImporter (`${type}-hinter`);
    if (DedicatedWidget) {
      const wireDedicatedHinter = Widget.Wired (DedicatedWidget);
      const WiredDedicatedWidget = wireDedicatedHinter (id);
      return <WiredDedicatedWidget />;
    } else {
      return (
        <HinterColumn
          kind={kind}
          title-text={title}
          title-glyph={glyph}
          rows={rows}
          selectedIndex={selectedIndex}
          onRowClick={(index, text) => this.do ('select-row', {index, text})}
        />
      );
    }
  }
}

export default Hinter;
