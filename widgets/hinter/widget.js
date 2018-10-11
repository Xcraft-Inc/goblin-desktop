import React from 'react';
import Widget from 'laboratory/widget';
import MouseTrap from 'mousetrap';
import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import _ from 'lodash';

const _Row = props => {
  return (
    <div className={props.selected ? props.styles.boxActive : props.styles.box}>
      <Label
        text={props.text}
        kind="large-single"
        justify="left"
        grow="1"
        wrap="no"
      />
    </div>
  );
};

const Row = Widget.connect((s, p) => {
  const selectedIndex = s.get(`widgets.${p.id}.selectedIndex`);
  return {
    text: s.get(`backend.${p.id}.rows[${p.rowIndex}]`),
    selected: selectedIndex === p.rowIndex,
  };
})(_Row);

const _List = props => {
  return (
    <div>
      {props.rows.map((row, index) => {
        return (
          <Row
            key={index}
            id={props.id}
            rowIndex={index}
            styles={props.rowStyles}
          />
        );
      })}
    </div>
  );
};

const List = Widget.connect((s, p) => {
  const rows = s.get(`backend.${p.id}.rows`, []);
  return {
    rows: rows,
  };
})(_List);

class Hinter extends Widget {
  constructor() {
    super(...arguments);

    this.onKeyUp = this.onKeyUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onValidate = this.onValidate.bind(this);
    this.selectRow = this.selectRow.bind(this);
    this.prevRow = this.prevRow.bind(this);
    this.nextRow = this.nextRow.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      type: 'type',
      kind: 'kind',
      title: 'title',
      glyph: 'glyph',
      status: 'status',
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
    this.prevRow();
  }

  onKeyDown() {
    this.nextRow();
  }

  nextRow() {
    this.dispatch({type: 'next-row'});
    this.do('next-row');
  }
  prevRow() {
    this.dispatch({type: 'prev-row'});
    this.do('prev-row');
  }
  selectRow(index) {
    if (index >= 0 && index < this.props.rows.size) {
      const value = this.props.rows.get(index);
      this.dispatch({type: 'select-row', index});
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
      glyphs,
      status,
      selectedIndex,
      newButtonTitle,
    } = this.props;

    if (!id) {
      return null;
    }
    this.dispatch({type: 'init-hinter'});
    return (
      <Container kind="view" grow="1" maxWidth="500px">
        <Container kind="pane-header-light">
          <Label
            kind="title"
            glyph={this.props.titleGlyph}
            text={this.props.titleText}
          />
        </Container>
        <Container kind="panes">
          <Container kind="pane-top">
            <List id={id} rowStyles={this.styles.classNames} />
          </Container>
        </Container>
      </Container>
    );

    /*return (
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
        onRowClick={this.selectRow}
        onRowDbClick={this.validateRow}
      />
    );*/
  }
}

export default Hinter;
