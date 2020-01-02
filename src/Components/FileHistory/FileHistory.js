import React, { useState } from "react";
import { connect } from "react-redux";
import * as APIUtility from "../../Util/API";
import { List, ListItem, makeStyles, Collapse, IconButton } from "@material-ui/core";
import { AddCircleOutline, RemoveCircleOutline } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(0.3)
  },
  root: {
    padding: theme.spacing(0.5)
  },
  nested: {
    paddingLeft: theme.spacing(4)
  }
}));

const FileHistory = props => {
  const classes = useStyles();
  const [isExpanded, setExpanded] = React.useState(false);
  const [versions, setVersions] = React.useState([]);

  // returns bold for the currently selected file, normal otherwise
  const getFontWeightFile = index => {
    if (index === props.fileIndex) {
      return "bold";
    }
    return "normal";
  };

  const getAnnotationsForFile = () => {
    const options = {
      method: "GET"
    };

    APIUtility.API.makeAPICall(
      APIUtility.GET_ANNOTATIONS_FILENAME_USER,
      props.annotationsList[props.index].name,
      options
    )
      .then(response => response.json())
      .then(data => {
        let dataVersions = [];
        for (let version of data) {
          dataVersions.push(version);
        }
        setVersions(dataVersions);
      })
      .catch(error => {
        console.log("ERROR:", error);
      });
  };

  const switchVersion = () => {
    //
  };

  const showHistory = () => {
    return versions.map(version => (
      <ListItem
        className={classes.nested}
        button
        key={version.updated}
        onClick={() => {
          switchVersion();
        }}
      >
        {version.sessionId !== props.sessionId ? version.updated : "Current"}
      </ListItem>
    ));
  };

  return (
    <div className={classes.root}>
      <ListItem
        button
        key={props.file.name}
        onClick={() => {
          if (props.index === props.fileIndex) {
            setExpanded(!isExpanded);
          } else {
            getAnnotationsForFile();
            setExpanded(false);
            props.switchFile(props.index);
          }
        }}
        style={{ fontWeight: getFontWeightFile(props.index) }}
      >
        {props.file.name}
        {props.fileIndex === props.index &&
          (isExpanded ? (
            <IconButton edge="end" aria-label="Collapse">
              <RemoveCircleOutline />
            </IconButton>
          ) : (
            <IconButton edge="end" aria-label="Expand">
              <AddCircleOutline />
            </IconButton>
          ))}
      </ListItem>

      {isExpanded && props.fileIndex === props.index && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List dense disablePadding>
            {showHistory()}
            {/* list item for current working version.
            if user switches away from file and comes back, it will be displayed because it's been saved
            need to check last version and see if it's same session id, then don't render an extra item */}
            {versions[versions.length - 1] && versions[versions.length - 1].sessionId !== props.sessionId ? (
              <ListItem
                className={classes.nested}
                button
                key="current"
                onClick={() => {
                  switchVersion();
                }}
                style={{ fontWeight: "bold" }}
              >
                Current
              </ListItem>
            ) : null}
          </List>
        </Collapse>
      )}
    </div>
  );
};

const mapStateToProps = state => {
  return {
    fileIndex: state.fileViewer.fileIndex,
    annotationsList: state.fileViewer.annotationsList,
    sessionId: state.fileViewer.sessionId
  };
};

const mapDispatchToProps = dispatch => {
  return {
    // setAnnotations: annotations => dispatch(actions.setAnnotations(annotations))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FileHistory);
