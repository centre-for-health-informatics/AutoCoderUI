import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "./tagTypes";
import Autocomplete from "@material-ui/lab/AutoComplete";
import { TextField, createMuiTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { green, red } from "@material-ui/core/colors";

const theme = createMuiTheme({
  pallete: {
    primary: green,
    secondary: red,
  },
});

const useStyles = makeStyles(() => ({
  searchBoxText: {
    paddingTop: theme.spacing(0),
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
    paddingBottom: theme.spacing(0),
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    marginBottom: theme.spacing(0),
  },
}));

const SearchBox = (props) => {
  const classes = useStyles();

  const getSearchTextValue = () => {
    if (Array.isArray(props.addingTags) && props.addingTags.length > 0) {
      return props.addingTags[0];
    } else {
      return null;
    }
  };

  const shouldDisableAutoComplete = () => {
    switch (props.annotationFocus) {
      case tagTypes.SENTENCES:
        return true;
      // case tagTypes.TOKENS:
      //   return true;
      default:
        return false;
    }
  };

  const getCurrentTagOptions = () => {
    let options;

    if (props.annotationFocus !== "NA") {
      options = props.tagTemplates.filter((tag) => {
        return tag.type.toLowerCase() === props.annotationFocus.toLowerCase();
      });
    } else {
      options = props.tagTemplates.filter((tag) => {
        return tag.type === "" || tag.type === null || tag.type === undefined;
      });
    }
    return options;
  };

  const searchboxSelectionChange = (event, selections) => {
    if (Array.isArray(selections)) {
      props.setAddingTags(selections);
    } else if (selections === null) {
      props.setAddingTags([]);
    } else {
      props.setAddingTags([selections]);
    }
  };

  const getOptionLabelFunc = () => {
    return (x) => x.id + (x.description !== "" ? ": " + x.description : "");
  };

  const getTextLabel = () => {
    switch (props.annotationFocus) {
      case tagTypes.SENTENCES:
        return "";
      // case tagTypes.TOKENS:
      //   return "";
      default:
        return "Search " + props.annotationFocus;
    }
  };

  return (
    <Autocomplete
      // multiple
      id={"tagSearchInputField"}
      value={getSearchTextValue()}
      disabled={shouldDisableAutoComplete()}
      filterSelectedOptions
      options={getCurrentTagOptions()}
      onChange={searchboxSelectionChange}
      getOptionLabel={getOptionLabelFunc()}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label={getTextLabel()}
          margin="normal"
          fullWidth
          className={classes.searchBoxText}
        />
      )}
      style={{ width: "95%", paddingRight: 10 }}
    />
  );
};

const mapStateToProps = (state) => {
  return {
    tagTemplates: state.fileViewer.tagTemplates,
    annotationFocus: state.fileViewer.annotationFocus, // the currently active type
    addingTags: state.tagManagement.addingTags, // the currently active tag
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setAddingTags: (tags) => dispatch(actions.setAddingTags(tags)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchBox);
