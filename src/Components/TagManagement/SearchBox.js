import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "./tagTypes";
import Autocomplete from "@material-ui/lab/AutoComplete";
import { TextField, createMuiTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { green, red } from "@material-ui/core/colors";
import * as APIUtility from "../../Util/API";
import { addDotToCode } from "../../Util/icdUtility";

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
  const [autoCompleteList, setAutoCompleteList] = useState([]);

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
    if (props.annotationFocus === tagTypes.ICD) {
      options = autoCompleteList;
    } else if (props.annotationFocus !== "") {
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
    if (selections && selections.code) {
      selections.id = selections.code;
      delete selections.code;
    }
    if (Array.isArray(selections)) {
      props.setAddingTags(selections);
    } else if (selections === null) {
      props.setAddingTags([]);
    } else {
      props.setAddingTags([selections]);
    }
    if (props.filterICD) {
      if (selections) {
        const newAnnotations = Array.from(props.entities).filter(
          (annotation) => annotation.tag === selections.id && annotation.type === tagTypes.ICD
        );
        props.setAnnotations(newAnnotations);
      } else {
        const newAnnotations = props.entities.filter((annotation) => annotation.type === tagTypes.ICD);
        props.setAnnotations(newAnnotations);
      }
    }
  };

  const getOptionLabelFunc = () => {
    return (x) =>
      (x.id ? (props.annotationFocus === tagTypes.ICD ? addDotToCode(x.id) : x.id) : addDotToCode(x.code)) +
      (x.description ? ": " + x.description : "");
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

  const onInputChange = (event, value) => {
    if (value !== "") {
      APIUtility.API.makeAPICall(APIUtility.CODE_AUTO_SUGGESTIONS, value.replace(".", ""))
        .then((response) => response.json())
        .then((results) => {
          populateAutoCompleteList(results);
        })
        .catch((error) => {
          console.log("ERROR:", error);
        });
    } else {
      populateAutoCompleteList({ "code matches": [], "description matches": [], "keyword matches": [] });
    }
  };

  const filterSearchBoxOptions = (options, state) => {
    if (props.annotationFocus === tagTypes.ICD) {
      return options;
    } else {
      const validOptions = [];
      const inputWords = state.inputValue.toLowerCase().split(" ");
      for (let option of options) {
        const optionName = option.id.toLowerCase() + (option.description ? " " + option.description.toLowerCase() : "");
        let shouldAdd = true; // whether the option should be added to validOptions
        for (let word of inputWords) {
          if (!optionName.includes(word)) {
            shouldAdd = false;
          }
        }
        if (shouldAdd) {
          validOptions.push(option);
        }
      }
      return validOptions;
    }
  };

  const populateAutoCompleteList = (suggestionsFromAPI) => {
    let tempAutoCompleteList = [];

    for (let codeMatch of suggestionsFromAPI["code matches"]) {
      codeMatch.type = tagTypes.ICD;
      tempAutoCompleteList.push(codeMatch);
    }

    for (let descMatch of suggestionsFromAPI["description matches"]) {
      descMatch.type = tagTypes.ICD;
      tempAutoCompleteList.push(descMatch);
    }

    for (let keyMatch of suggestionsFromAPI["keyword matches"]) {
      keyMatch.type = tagTypes.ICD;
      tempAutoCompleteList.push(keyMatch);
    }

    setAutoCompleteList(tempAutoCompleteList);
  };

  return (
    <Autocomplete
      // multiple
      id={"tagSearchInputField"}
      value={getSearchTextValue()}
      disabled={shouldDisableAutoComplete()}
      filterOptions={filterSearchBoxOptions}
      filterSelectedOptions={props.annotationFocus === tagTypes.ICD ? false : true}
      options={getCurrentTagOptions()}
      onChange={searchboxSelectionChange}
      onInputChange={onInputChange}
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
    filterICD: state.fileViewer.filterICD,
    entities: state.fileViewer.entities,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setAddingTags: (tags) => dispatch(actions.setAddingTags(tags)),
    setAnnotations: (annotations) => dispatch(actions.setAnnotations(annotations)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchBox);
