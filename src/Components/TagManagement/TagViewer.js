import React from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import ListViewer from "../../Components/ListViewer/ListViewer";

const TagViewer = props => {
  const shouldHideRemoveButton = index => {
    return props.tagTemplates[index].disabled ? true : false;
  };

  const shouldHideAcceptButton = index => {
    return props.tagTemplates[index].disabled ? false : true;
  };

  const disableTag = event => {
    props.disableTagByIndex(event.currentTarget.id);
  };

  const enableTag = event => {
    props.enableTagByIndex(event.currentTarget.id);
  };

  const selectedTagsComponentMenuItems = [
    { menuItemOnClick: props.tagTemplates.length < 2 ? null : props.enableAllTags, menuItemText: "Enable All" },
    { menuItemOnClick: props.tagTemplates.length < 2 ? null : props.disableAllTags, menuItemText: "Disable All" }
  ];

  return (
    <ListViewer
      title="Tags"
      dontAddDotBoolean={true}
      items={props.tagTemplates}
      valueName="id"
      enableFilter={true}
      filterOptionsGetLabel={item => item.id + ": " + item.description}
      descriptionName="description"
      acceptItemButton={{ title: "Enable tag", onClick: enableTag }}
      removeItemButton={{ title: "Disable tag", onClick: disableTag }}
      allowRearrage={props.tagTemplates.length > 1}
      onSortEndCallback={updatedList => {
        props.setTagTemplates(updatedList);
      }}
      shouldHideAcceptButton={shouldHideAcceptButton}
      shouldHideRemoveButton={shouldHideRemoveButton}
      menuOptions={selectedTagsComponentMenuItems}
    />
  );
};

const mapStateToProps = state => {
  return {
    tagTemplates: state.fileViewer.tagTemplates
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setTagTemplates: tags => dispatch(actions.setTagTemplates(tags)),
    enableTagByIndex: index => dispatch(actions.enableTagByIndex(index)),
    disableTagByIndex: index => dispatch(actions.disableTagByIndex(index)),
    enableAllTags: () => dispatch(actions.enableAllTags()),
    disableAllTags: () => dispatch(actions.disableAllTags())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagViewer);
