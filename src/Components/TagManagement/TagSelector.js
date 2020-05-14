import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "./tagTypes";
import { createMuiTheme, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { green, red } from "@material-ui/core/colors";
import SearchBox from "./SearchBox";

const theme = createMuiTheme({
  pallete: {
    primary: green,
    secondary: red,
  },
});

const useStyles = makeStyles(() => ({
  root: {
    height: "100%",
    width: "100%",
    borderRadius: "5px",
    overflow: "auto",
    backgroundColor: "inherit",
    flexGrow: 1,
  },
  radioButtonForm: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(0),
  },
  searchBox: {
    paddingTop: theme.spacing(0),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

const TagSelector = (props) => {
  const classes = useStyles();

  const handleTypeChange = (event) => {
    let newSelection = event.target.value;

    props.setSpansRendered(false); // flag used to prevent CustomAnotator from drawing lines pre-maturely due to race conditions
    props.setAnnotationFocus(newSelection);

    switch (newSelection) {
      case tagTypes.SENTENCES:
        props.setAnnotations(props.sentences);
        break;
      // case tagTypes.TOKENS:
      //   props.setAnnotations(props.tokens);
      //   break;

      default:
        props.setAnnotations(props.entities.filter((annotation) => annotation.type === newSelection));
    }

    props.setAddingTags([]);
    props.setFilterICD(false);
  };

  const makeCustomTypesRadioButtons = () => {
    const customTagTypes = new Set();

    props.tagTemplates.forEach((tagTemplate) => {
      if (
        tagTemplate.type !== tagTypes.TOKENS &&
        tagTemplate.type !== tagTypes.SENTENCES &&
        tagTemplate.type !== tagTypes.ICD
      ) {
        if (tagTemplate.type && tagTemplate.type !== "") {
          customTagTypes.add(tagTemplate.type);
        } else {
          customTagTypes.add("NA");
        }
      }
    });

    const html = [];

    customTagTypes.forEach((tagType, index) =>
      html.push(
        <FormControlLabel
          key={"custom-radio-select" + index}
          value={tagType}
          control={<Radio />}
          label={tagType}
          labelPlacement="end"
        />
      )
    );
    return html;
  };

  return (
    <div className={classes.root}>
      <div className={classes.radioButtonForm}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Annotation Type</FormLabel>
          <RadioGroup aria-label="type" name="type" value={props.annotationFocus} onChange={handleTypeChange} row>
            {props.areSentencesAvailable && (
              <FormControlLabel
                value={tagTypes.SENTENCES}
                control={<Radio />}
                label={tagTypes.SENTENCES}
                labelPlacement="end"
              />
            )}
            {/* <FormControlLabel
              value={tagTypes.TOKENS}
              control={<Radio />}
              label={tagTypes.TOKENS}
              labelPlacement="end"
            /> */}
            {makeCustomTypesRadioButtons()}
            <FormControlLabel value={tagTypes.ICD} control={<Radio />} label={tagTypes.ICD} labelPlacement="end" />
          </RadioGroup>
        </FormControl>
      </div>
      <div className={classes.searchBox}>
        <SearchBox />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    tagTemplates: state.fileViewer.tagTemplates,
    annotationFocus: state.fileViewer.annotationFocus, // the currently active type
    sentences: state.fileViewer.sentences,
    tokens: state.fileViewer.tokens,
    entities: state.fileViewer.entities,
    entityTagsList: state.tagManagement.uploadedTags, // a selection of tags for labelling entities
    areSentencesAvailable: state.fileViewer.sentencesAvailable,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setTagTemplates: (tags) => dispatch(actions.setTagTemplatesWithCallback(tags)),
    setFilterICD: (filterICD) => dispatch(actions.setFilterICD(filterICD)),
    appendToCache: (codeObjArray) => dispatch(actions.appendToCache(codeObjArray)),
    setAddingTags: (tags) => dispatch(actions.setAddingTags(tags)),
    setAnnotationFocus: (annotationFocus) => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setAnnotations: (annotations) => dispatch(actions.setAnnotations(annotations)),
    setSpansRendered: (spansRendered) => dispatch(actions.setSpansRendered(spansRendered)),
    setSelectedCode: (selectedCode) => dispatch(actions.setSelectedCode(selectedCode)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagSelector);
