import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import TextFieldNC from 'goblin-gadgets/widgets/text-field-nc/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import T from 't';

/******************************************************************************/

class FacetPreFilterEditor extends Widget {
  constructor() {
    super(...arguments);

    this.state = {selectedPreFilter: null, editedPreFilter: null};
    // Add a new empty pre-filter
    this.onAdd = this.onAdd.bind(this);
    // Apply filters of selected pre-filter
    this.onApplyFilter = this.onApplyFilter.bind(this);
    // Change name of current selected pre-filter
    this.onEdit = this.onEdit.bind(this);
    // Save name of current edited pre-filter
    this.onSaveName = this.onSaveName.bind(this);
    // Cancel edition of current edited pre-filter
    this.onCancelEdit = this.onCancelEdit.bind(this);
    // Save filters on current selected pre-filter
    this.onSaveFilters = this.onSaveFilters.bind(this);
    // Delete current selected pre-filter
    this.onDelete = this.onDelete.bind(this);
  }

  onAdd() {
    // TODO: Call quest to create an entity
  }

  onApplyFilter(id) {
    if (this.state.selectedPreFilter !== id) {
      // TODO: Call quest to apply filters of selected pre-filter
      this.setState({selectedPreFilter: id});
    } else {
      // TODO: Call quest to apply default filter ?
      this.setState({selectedPreFilter: null});
    }
  }

  onEdit(id) {
    // Manage state in a frontend service
    this.setState({editedPreFilter: id});
  }

  onCancelEdit() {
    // Manage state in a frontend service
    this.setState({editedPreFilter: null});
  }

  onSaveName() {
    // TODO: Call quest to save name of pre-filter
    this.setState({editedPreFilter: null});
  }
  onSaveFilters() {
    // TODO: Call quest to save filters in pre-filter entity
  }
  onDelete() {
    // TODO: Call quest to delete pre-filter
  }

  renderListItem(item, index) {
    return (
      <React.Fragment key={index}>
        {this.renderListItemName(item)}
        {this.renderListItemButtons(item.id)}
      </React.Fragment>
    );
  }

  renderListItemName(item) {
    if (this.state.editedPreFilter === item.id) {
      return (
        <div className={this.styles.classNames.listItemEdited}>
          <TextFieldNC value={item.name} grow="1" />
          <Button
            key="1"
            glyph={'solid/check'}
            tooltip={T('Modifier le nom du pré-filtrage')}
            onClick={() => {
              this.onSaveName(item);
            }}
          />
          <Button
            key="2"
            glyph={'solid/times'}
            tooltip={T('Annuler la modification')}
            onClick={this.onCancelEdit}
          />
        </div>
      );
    } else {
      const selectedFilter = item.id === this.state.selectedPreFilter;
      const className = selectedFilter
        ? this.styles.classNames.listItemActive
        : this.styles.classNames.listItem;
      return (
        <div className={className}>
          <Label
            text={item.name}
            grow="1"
            onClick={() => this.onApplyFilter(item.id)}
          />
          <Button
            glyph={'solid/pencil'}
            tooltip={T('Editer le nom du pré-filtrage')}
            onClick={() => {
              this.onEdit(item.id);
            }}
          />
        </div>
      );
    }
  }

  renderListItemButtons(id) {
    if (this.state.selectedPreFilter !== id) {
      return null;
    }
    return (
      <div className={this.styles.classNames.buttons}>
        <Label
          text={T('Sauvegarder')}
          tooltip={T('Sauvegarder le pré-filtrage')}
          glyph="solid/save"
          className={this.styles.classNames.button}
        />
        <Label
          text={T('Supprimer')}
          tooltip={T('Supprimer le pré-filtrage')}
          glyph="solid/trash"
          className={this.styles.classNames.button}
        />
      </div>
    );
  }

  renderList() {
    return (
      <div>
        {this.props.preFilters.map((item, index) =>
          this.renderListItem(item, index)
        )}
      </div>
    );
  }

  renderAddButton() {
    return (
      <>
        <Label
          text={T('Ajouter')}
          glyph="solid/plus"
          onClick={this.onAdd}
          tooltip={T('Ajouter un nouveau pré-filtrage')}
          className={this.styles.classNames.button}
        />
      </>
    );
  }

  render() {
    if (!this.props.prototypeMode) {
      return null;
    }

    return (
      <div className={this.styles.classNames.container}>
        <div className={this.styles.classNames.containerTitle}>
          <Label kind="title" text={T('Pré-filtrage')} />
        </div>
        <div>
          {this.renderList()}
          {this.renderAddButton()}
        </div>
      </div>
    );
  }
}

/******************************************************************************/

const FacetPreFilterEditorConnected = Widget.connect((state) => {
  const userSession = Widget.getUserSession(state);
  const prototypeMode = userSession.get('prototypeMode');
  const preFilters = [
    {id: 'test@test', name: 'Need check'},
    {id: 'test@test2', name: 'E-bill errors'},
  ];
  return {prototypeMode, preFilters};
})(FacetPreFilterEditor);

export default FacetPreFilterEditorConnected;
