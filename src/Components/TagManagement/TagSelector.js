import React, { useState } from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "./tagTypes";
import Autocomplete from "@material-ui/lab/AutoComplete";
import { TextField, createMuiTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { green, red } from "@material-ui/core/colors";

const theme = createMuiTheme({
  pallete: {
    primary: green,
    secondary: red
  }
});

const useStyles = makeStyles(() => ({
  root: {
    height: "100%",
    width: "100%",
    borderRadius: "5px",
    overflow: "auto",
    backgroundColor: "inherit",
    flexGrow: 1
  },
  radioButtonForm: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(0)
  },
  searchBox: {
    paddingTop: theme.spacing(0),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  searchBoxText: {
    paddingTop: theme.spacing(0),
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
    paddingBottom: theme.spacing(0),
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    marginBottom: theme.spacing(0)
  }
}));

const TagSelector = props => {
  const classes = useStyles();

  const handleTypeChange = event => {
    let newSelection = event.target.value;
    if (newSelection === props.annotationFocus) {
      // unselecting the currently selected value
      newSelection = "";
    }

    props.setSpansRendered(false);
    props.setAnnotationFocus(newSelection);

    switch (newSelection) {
      case tagTypes.SECTIONS:
        props.setAnnotations(props.sections);
        break;
      case tagTypes.SENTENCES:
        props.setAnnotations(props.sentences);
        break;
      case tagTypes.ENTITIES:
        props.setAnnotations(props.entities);
        break;
      case tagTypes.TOKENS:
        props.setAnnotations(props.tokens);
        break;
      case tagTypes.ICD_CODES:
        //TODO
        console.log("Not implemented");
        break;
      default:
        console.log("No annotation type selected.");
    }

    props.setAddingTags([]);
  };

  const getCurrentTagOptions = () => {
    const options = props.tagTemplates.filter(tag => {
      return tag.type === props.annotationFocus;
    });
    return options;
  };

  const getOptionLabelFunc = () => {
    return x => x.id + (x.description !== "" ? ": " + x.description : "");
  };

  const getTextLabel = () => {
    switch (props.annotationFocus) {
      case tagTypes.SECTIONS:
        return "Search " + tagTypes.SECTIONS;
      case tagTypes.ENTITIES:
        return "Search " + tagTypes.ENTITIES;
      default:
        return "";
    }
  };

  const shouldDisableAutoComplete = () => {
    switch (props.annotationFocus) {
      case tagTypes.SECTIONS:
        return false;
      case tagTypes.ENTITIES:
        return false;
      case tagTypes.SENTENCES:
        return true;
      case tagTypes.TOKENS:
        return true;
      case tagTypes.ICD_CODES:
        return false;
      default:
        return true;
    }
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

  const getSearchTextValue = () => {
    if (Array.isArray(props.addingTags) && props.addingTags.length > 0) {
      return props.addingTags[0];
    } else {
      return null;
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.radioButtonForm}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Annotation Type</FormLabel>
          <RadioGroup aria-label="type" name="type" value={props.annotationFocus} onChange={handleTypeChange} row>
            <FormControlLabel
              value={tagTypes.SECTIONS}
              control={<Radio />}
              label={tagTypes.SECTIONS}
              labelPlacement="end"
            />
            <FormControlLabel
              value={tagTypes.SENTENCES}
              control={<Radio />}
              label={tagTypes.SENTENCES}
              labelPlacement="end"
            />
            <FormControlLabel
              value={tagTypes.ENTITIES}
              control={<Radio />}
              label={tagTypes.ENTITIES}
              labelPlacement="end"
            />
            <FormControlLabel
              value={tagTypes.TOKENS}
              control={<Radio />}
              label={tagTypes.TOKENS}
              labelPlacement="end"
            />
          </RadioGroup>
        </FormControl>
      </div>
      <div className={classes.searchBox}>
        <Autocomplete
          // multiple
          id={"tagSearchInputField"}
          value={getSearchTextValue()}
          disabled={shouldDisableAutoComplete()}
          filterSelectedOptions
          options={getCurrentTagOptions()}
          onChange={searchboxSelectionChange}
          getOptionLabel={getOptionLabelFunc()}
          renderInput={params => (
            <TextField
              {...params}
              variant="standard"
              label={getTextLabel()}
              margin="normal"
              fullWidth
              className={classes.searchBoxText}
            />
          )}
        />
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    tagTemplates: state.fileViewer.tagTemplates,
    annotationFocus: state.fileViewer.annotationFocus, // the currently active type
    addingTags: state.tagManagement.addingTags, // the currently active tag
    sections: state.fileViewer.sections,
    sentences: state.fileViewer.sentences,
    tokens: state.fileViewer.tokens,
    entities: state.fileViewer.entities,
    entityTagsList: state.tagManagement.uploadedTags // a selection of tags for labelling entities
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setAddingTags: tags => dispatch(actions.setAddingTags(tags)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations)),
    setSpansRendered: spansRendered => dispatch(actions.setSpansRendered(spansRendered))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagSelector);
