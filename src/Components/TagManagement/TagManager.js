import React, { useState } from "react";
import MaterialTable from "material-table";
import TableToolbar from "./TableToolbar";
import ColorPicker from "../ColorPicker/ColorPicker";
import { forwardRef } from "react";
import * as tagTypes from "./tagTypes";

import LoadDefaultsIcon from "@material-ui/icons/RestorePageOutlined";
import DeleteAllIcon from "@material-ui/icons/DeleteForeverOutlined";
import UploadIcon from "@material-ui/icons/Backup";
import AddBox from "@material-ui/icons/AddBox";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";

import * as actions from "../../Store/Actions/index";
import { connect } from "react-redux";

const tableIcons = {
  LoadDefaults: forwardRef((props, ref) => <LoadDefaultsIcon {...props} ref={ref} />),
  DeleteAll: forwardRef((props, ref) => <DeleteAllIcon {...props} ref={ref} />),
  Upload: forwardRef((props, ref) => <UploadIcon {...props} ref={ref} />),
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

function TagManager(props) {
  const [showFilters, setShowFilters] = useState(false);

  const renderColor = rowData => {
    return (
      <ColorPicker
        color={rowData.color}
        setColor={color => {
          modifyColor(rowData, color);
        }}
      />
    );
  };

  const modifyColor = (tag, color) => {
    let newTag = JSON.parse(JSON.stringify(tag));
    newTag.color = color;
    onRowUpdate(newTag, tag);
  };

  const columns = [
    { title: "Id", field: "id" },
    { title: "Description", field: "description" },
    { title: "Color", field: "color", render: renderColor },
    {
      title: "Type",
      field: "type"
    }
  ];

  /**
   * Validates the data input from Table. returns null if data is valid, returns a promise if there is error.
   */
  const isTableInputValid = data => {
    if (data.type === undefined || data.type === "") {
      return new Promise(resolve => {
        props.setAlertMessage({
          message: "Changes not saved: missing 'Type'",
          messageType: "error"
        });
        resolve();
      });
    } else if (
      data.type.toUpperCase() === tagTypes.TOKENS.toUpperCase() ||
      data.type.toUpperCase() === tagTypes.SENTENCES.toUpperCase()
    ) {
      return new Promise(resolve => {
        props.setAlertMessage({
          message:
            "Changes not saved: cannot used the following system reserved types " +
            tagTypes.TOKENS +
            ", " +
            tagTypes.SENTENCES,
          messageType: "error"
        });
        resolve();
      });
    }
    return null;
  };

  /**
   * Called when adding new row, must return a Promise to be used by MaterialTable
   */
  const onRowAdd = newData => {
    let inValidPromise = isTableInputValid(newData);
    if (inValidPromise) {
      return inValidPromise;
    }

    return new Promise(resolve => {
      setTimeout(() => {
        props.setTagTemplates([...props.tagTemplates, newData]);
        resolve();
      }, 600);
    });
  };

  /**
   * Called when editing a row, must return a Promise to be used by MaterialTable
   */
  const onRowUpdate = (newData, oldData) => {
    let inValidPromise = isTableInputValid(newData);
    if (inValidPromise) {
      return inValidPromise;
    }

    updateAnnotations(newData, oldData);

    // updating tag templates
    return new Promise(resolve => {
      // setTimeout(() => {
      if (oldData) {
        const data = [...props.tagTemplates];
        data[data.indexOf(oldData)] = newData;
        props.setTagTemplates(data);
      }
      resolve();
      // }, 600);
    });
  };

  const updateAnnotations = (newData, oldData) => {
    updateAnnotationSimple(newData, oldData, props.entities, props.setEntities);

    // if type changes - move annotations to other type
    // and then change whatever else changed
    if (newData.type !== oldData.type) {
      updateAnnotationsTypeChange(newData, oldData);
    }
  };

  const updateAnnotationsTypeChange = (newData, oldData) => {
    // changing from entity to different entity type
    for (let annotation of props.entities) {
      if (annotation.type === oldData.type && annotation.tag === oldData.id) {
        annotation.type = newData.type;
      }
    }
  };

  /**
   * used for setting the tag and color of existing annotations when a tag is changed
   */
  const updateAnnotationSimple = (newData, oldData, itemsToUpdate, functionToSetItems) => {
    let items = Array.from(itemsToUpdate);
    for (let item of items) {
      if (item.tag === oldData.id) {
        item.tag = newData.id;
        item.color = newData.color;
      }
    }
    functionToSetItems(items);
  };

  const onRowDelete = oldData => {
    // removing annotations for appropriate type
    removeAnnotationsForDeletedTags(props.entities, props.setEntities, oldData);

    // returning promise
    return new Promise(resolve => {
      // setTimeout(() => {
      const data = [...props.tagTemplates];
      data.splice(data.indexOf(oldData), 1);
      props.setTagTemplates(data);
      resolve();
      // }, 600);
    });
  };

  const removeAnnotationsForDeletedTags = (itemsToUpdate, functionToSetItems, oldData) => {
    let indicesToRemove = [];
    let items = Array.from(itemsToUpdate);
    for (let i = 0; i < items.length; i++) {
      if (items[i].tag === oldData.id && items[i].type === oldData.type) {
        indicesToRemove.push(i);
      }
    }
    indicesToRemove.sort();
    while (indicesToRemove.length) {
      items.splice(indicesToRemove.pop(), 1);
    }
    functionToSetItems(items);
  };

  return (
    <MaterialTable
      components={{
        Toolbar: props => <TableToolbar {...props} showFilters={showFilters} setShowFilters={setShowFilters} />
      }}
      icons={tableIcons}
      title="Tags"
      columns={columns}
      data={props.tagTemplates}
      editable={{
        onRowAdd: onRowAdd,
        onRowUpdate: onRowUpdate,
        onRowDelete: onRowDelete
      }}
      options={{
        toolbar: true,
        filtering: showFilters,
        grouping: false,
        exportButton: true,
        exportAllData: true,
        search: false,
        padding: "dense",
        headerStyle: { padding: 0 },
        rowStyle: { padding: 0 },
        filterCellStyle: { padding: 0 }
      }}
    />
  );
}

const mapStateToProps = state => {
  return {
    tagTemplates: state.fileViewer.tagTemplates,
    entities: state.fileViewer.entities
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setTagTemplates: tags => dispatch(actions.setTagTemplatesWithCallback(tags)),
    setEntities: entities => dispatch(actions.setEntities(entities)),
    setAlertMessage: newValue => dispatch(actions.setAlertMessage(newValue))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagManager);
