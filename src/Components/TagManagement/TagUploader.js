import React from "react";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "../TagManagement/tagTypes";
import downloader from "../../Util/download";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  }
}));

const TagUploader = props => {
  const classes = useStyles();
  const fileInputRef = React.createRef();

  const openExplorer = () => {
    if (props.disabled) {
      return;
    }
    fileInputRef.current.click();
  };

  const readFile = files => {
    if (files[0]) {
      let fileReader = new FileReader();

      fileReader.onload = e => {
        let lines = e.target.result.replace(/\r\n/g, "\n").split("\n"); // Replace /r/n with /n for Windows OS
        let tags = readTagsFromStrings(lines);
        props.setTagTemplates(tags).then(() => {
          console.log(props.tagTemplates);
        });
      };

      fileReader.readAsText(files[0]);
    }
  };

  const cleanInput = (value, defaultValue) => {
    if (value !== undefined) {
      value = value.trim();
    } else {
      value = defaultValue;
    }
    return value;
  };

  const readTagsFromStrings = lines => {
    const oldTags = Array.from(props.tagTemplates);
    const newTags = [];
    const descriptionUpdated = []; // Keeps track of duplicate tags id with description update
    const colorUpdated = [];
    const typeUpdated = [];

    for (let i = 0; i < lines.length; i++) {
      const items = lines[i].split(",");

      const id = items[0];
      let description = items[1];
      let color = items[2];
      let type = items[3];

      description = cleanInput(description, id);
      color = cleanInput(color, "");
      type = cleanInput(type, tagTypes.ENTITIES);

      if (id !== "") {
        // line is not empty

        let duplicateTag = oldTags.find(tag => tag.id === id);

        if (duplicateTag !== undefined) {
          // tag id already exist in oldTags

          if (description !== duplicateTag.description) {
            // description update
            duplicateTag.description = description;
            descriptionUpdated.push(duplicateTag);
          }
        } else {
          // the tag does not exist in oldTags
          oldTags.push({ id, description, color, type });
          newTags.push({ id, description, color, type });
        }
      }
    }
    generateAlert(newTags, descriptionUpdated, colorUpdated, typeUpdated);
    return oldTags;
  };

  const generateAlert = (newTags, descriptionUpdated, colorUpdated, typeUpdated) => {
    if (newTags.length > 0) {
      props.setAlertMessage({
        message: newTags.length + " new tags have been created. ",
        messageType: "success"
      });
    }

    if (descriptionUpdated.length > 0) {
      props.setAlertMessage({
        message: descriptionUpdated.length + " tags have updated descriptions. ",
        messageType: "success"
      });
    }

    if (colorUpdated.length > 0) {
      props.setAlertMessage({
        message: colorUpdated.length + " tags have updated colors. ",
        messageType: "success"
      });
    }

    if (typeUpdated.length > 0) {
      props.setAlertMessage({
        message: typeUpdated.length + " tags have updated types. ",
        messageType: "success"
      });
    }
  };

  const parseTagsToDownload = () => {
    let tagsAsText = "";
    const tags = props.tagTemplates;
    tags.forEach(tag => {
      tagsAsText += tag.id + "," + tag.description + "," + (tag.disabled ? "d" : "") + "\n";
    });
    downloader("tags.txt", tagsAsText);
  };

  const clearAllTags = () => {
    props.setTagTemplates([]);
    props.setAlertMessage({
      message: "All tags cleared",
      messageType: "success"
    });
  };

  return (
    <div className="fileUpload">
      <Button onClick={openExplorer} variant="contained" color="primary" className={classes.button}>
        Upload Tags
      </Button>
      <input
        ref={fileInputRef}
        style={{ display: "none" }}
        type="file"
        onChange={e => readFile(e.target.files)}
      ></input>
      <Button onClick={parseTagsToDownload} variant="contained" color="primary" className={classes.button}>
        {" "}
        Download Tags
      </Button>
      <Button onClick={clearAllTags} variant="contained" color="secondary" className={classes.button}>
        Clear All Tags
      </Button>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    tagTemplates: state.fileViewer.tagTemplates
  };
};

const mapDispatchToProps = dispatch => {
  return {
    // setTagTemplates: tags => dispatch(actions.setTagTemplates(tags)),
    setTagTemplates: tags => dispatch(actions.setTagTemplatesWithCallback(tags)),
    setAlertMessage: newValue => dispatch(actions.setAlertMessage(newValue))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagUploader);
