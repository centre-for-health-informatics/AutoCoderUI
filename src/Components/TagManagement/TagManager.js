import React from "react";
import MaterialTable from "material-table";

import { forwardRef } from "react";

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
import * as tagTypes from "./tagTypes";
import { ThemeProvider } from "@material-ui/core";

import TagUploader from "./TagUploader";

const tableIcons = {
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
  const renderColor = rowData => {
    return rowData.color;
  };

  const columns = [
    { title: "Id", field: "id" },
    { title: "Description", field: "description" },
    { title: "Color", field: "color", render: renderColor },
    { title: "Type", field: "type", lookup: { 1: tagTypes.ENTITIES, 2: tagTypes.SECTIONS } }
  ];

  const onRowAdd = newData => {
    return new Promise(resolve => {
      setTimeout(() => {
        props.setTagTemplates([...props.tagTemplates, newData]);
        resolve();
      }, 600);
    });
  };

  const onRowUpdate = (newData, oldData) => {
    return new Promise(resolve => {
      setTimeout(() => {
        if (oldData) {
          const data = [...props.tagTemplates];
          data[data.indexOf(oldData)] = newData;
          props.setTagTemplates(data);
        }
        resolve();
      }, 600);
    });
  };

  const onRowDelete = oldData => {
    return new Promise(resolve => {
      setTimeout(() => {
        const data = [...props.tagTemplates];
        data.splice(data.indexOf(oldData), 1);
        props.setTagTemplates(data);
        resolve();
      }, 600);
    });
  };

  return (
    <MaterialTable
      //   components={{ Toolbar: props => <TagUploader /> }}
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
        filtering: true,
        grouping: false,
        exportButton: true,
        exportAllData: true,
        search: false,
        padding: "dense",
        headerStyle: { padding: 0 },
        rowStyle: { padding: 0 },
        filterCellStyle: {
          padding: 0
        }
      }}
    />
  );
}

const mapStateToProps = state => {
  return {
    tagTemplates: state.fileViewer.tagTemplates
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setTagTemplates: tags => dispatch(actions.setTagTemplatesWithCallback(tags)),
    enableTagByIndex: index => dispatch(actions.enableTagByIndex(index)),
    disableTagByIndex: index => dispatch(actions.disableTagByIndex(index)),
    enableAllTags: () => dispatch(actions.enableAllTags()),
    disableAllTags: () => dispatch(actions.disableAllTags())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagManager);
