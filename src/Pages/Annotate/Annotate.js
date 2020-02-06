import React, { useState, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import { defaultLayouts } from "./layouts";
import MenuBar from "../../Components/MenuBar/MenuBar";
import * as actions from "../../Store/Actions/index";
import { getFromLS, saveToLS } from "../../Util/layoutFunctions";
import { connect } from "react-redux";
import { useAlert, positions } from "react-alert";
import { Redirect } from "react-router";
import Loading from "../Loading/Loading";
import * as APIUtility from "../../Util/API";
import * as tagTypes from "../../Components/TagManagement/tagTypes";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import TagSelector from "../../Components/TagManagement/TagSelector";
import Legend from "../../Components/CustomAnnotator/Legend";
import ManageFiles from "../../Components/ManageFiles/ManageFiles";
import { mapColors, setDefaultTags } from "../../Components/TagManagement/tagUtil";
import { Switch, FormControlLabel, Tooltip } from "@material-ui/core";
import LoadingIndicator from "../../Components/LoadingIndicator/LoadingIndicator";
import CustomAnnotator from "../../Components/CustomAnnotator/CustomAnnotator";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("annotateLayouts", "layouts") || defaultLayouts;

const Annotate = props => {
  const [layouts, setLayouts] = useState(originalLayouts);
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const alert = useAlert();

  const onLayoutChange = layouts => {
    setLayouts(layouts);
    saveToLS("annotateLayouts", "layouts", layouts);
  };

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    saveToLS("annotateLayouts", "layouts", defaultLayouts);
  };

  const handleLayoutModifierButton = () => {
    const layoutModifiable = !isLayoutModifiable;
    setLayoutModifiable(layoutModifiable);
  };

  const highlightEditDiv = isLayoutModifiable ? "grid-border edit-border" : "grid-border";

  // ComponentWillUnmount
  useEffect(() => {
    return () => {
      props.setAnnotationFocus("");
      props.setAnnotations([]);
    };
  }, []);

  // ComponentDidMount
  useEffect(() => {
    setLayouts(getFromLS("annotateLayouts", "layouts") || defaultLayouts);
    APIUtility.API.verifyLSToken(() => setIsLoading(false));
    // Setting up default tags if they haven't been already added.
    // This prevents tags from being added if the user explicitly deleted all of them
    setDefaultTags(props.setTagTemplates, props.initialTagsAdded);
    props.setInitialTagsAdded(true);
    if (!props.sessionId) {
      // generating session ID if one doesn't exist already
      props.setSessionId(Date.now().toString() + Math.floor(Math.random() * 1000000).toString());
    }
  }, []);

  // Map colors
  useEffect(() => {
    mapColors(props.tagTemplates);
  }, [props.tagTemplates]);

  // Display alert message
  useEffect(() => {
    if (props.alertMessage) {
      alert.show(props.alertMessage.message, {
        timeout: 5000,
        position: positions.MIDDLE,
        type: props.alertMessage.messageType,
        onClose: () => {
          props.setAlertMessage(null);
        }
      });
    }
  }, [props.alertMessage]);

  // checks the tags in use to generate a list for export, saving, etc.
  const checkTagsInUse = annotation => {
    let tagTemplates = Array.from(props.tagTemplates);
    const tagsInUse = new Set();
    for (let tag of tagTemplates) {
      for (let entity of annotation[tagTypes.ENTITIES]) {
        if (tag.id === entity.tag && tag.type === entity.type) {
          tagsInUse.add(tag);
        }
      }
    }
    return Array.from(tagsInUse);
  };

  if (isLoading) {
    return <Loading />;
  }

  // if (props.isServerDown) {
  //   return <Redirect to="/server-down" />;
  // }

  if (!props.isAuthorized) {
    return <Redirect to="/sign-in" />;
  }

  // renders the text and annotations if Spacy is not loading
  const renderCustomAnnotator = () => {
    if (props.isSpacyLoading) {
      return <LoadingIndicator />;
    }
    return <CustomAnnotator saveAnnotations={saveAnnotations} checkTagsInUse={checkTagsInUse} />;
  };

  // Saves annotations to database
  // optional parameter of state for when async actions are an issue, the state is created as a promise then passed into the method
  const saveAnnotations = (state = null) => {
    const annotations = {};
    if (state) {
      // creating object to save
      annotations[tagTypes.ENTITIES] = state.fileViewer.currentEntities;
      annotations[tagTypes.SENTENCES] = state.fileViewer.currentSentences;
      annotations.name = state.fileViewer.annotationsList[state.fileViewer.fileIndex].name;
      annotations.sessionId = state.fileViewer.sessionId;
      annotations.tagTemplates = checkTagsInUse(annotations);
    } else {
      // creating object to save
      annotations[tagTypes.ENTITIES] = props.currentEntities;
      annotations[tagTypes.SENTENCES] = props.currentSentences;
      annotations.name = props.annotationsList[props.fileIndex].name;
      annotations.sessionId = props.sessionId;
      annotations.tagTemplates = checkTagsInUse(annotations);
    }
    const options = {
      method: "POST",
      body: annotations
    };

    // making the API call to save annotations
    APIUtility.API.makeAPICall(APIUtility.UPLOAD_ANNOTATIONS, null, options).catch(error => {
      console.log("ERROR:", error);
    });
  };

  return (
    <div>
      <div>
        <MenuBar
          title="Annotate"
          projectLink
          tagsLink
          adminLink={props.userRole === "admin"}
          handleLayoutConfirm={() => handleLayoutModifierButton()}
          handleResetLayout={resetLayout}
          inModifyMode={isLayoutModifiable}
        />
      </div>
      <ResponsiveReactGridLayout
        className="layout"
        rowHeight={10}
        cols={{ lg: 48, md: 40, sm: 24, xs: 16, xxs: 8 }}
        layouts={layouts}
        draggableCancel="input,textarea"
        isDraggable={isLayoutModifiable}
        isResizable={isLayoutModifiable}
        onLayoutChange={(layout, layouts) => onLayoutChange(layouts)}
      >
        <div key="tagSelector" className={highlightEditDiv} style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ flex: 2.5 }}>
            <TagSelector />
          </div>
          <div style={{ flex: 1 }}>
            <Tooltip
              title={
                "Enabling this will make annotations snap to the whole word. This removes the need for precision when selecting text."
              }
            >
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    color="primary"
                    checked={props.snapToWord}
                    onChange={() => {
                      props.setSnapToWord(!props.snapToWord);
                    }}
                  />
                }
                label="Snap"
              />
            </Tooltip>
            <Tooltip
              title={
                "Enabling this will cause the next annotation to be linked to the previous one. It is not possible to enable this if there are currently no annotations. Shortcut key: 'A'"
              }
            >
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    color="primary"
                    checked={props.linkedListAdd}
                    onChange={() => {
                      props.setLinkedListAdd(!props.linkedListAdd);
                    }}
                  />
                }
                label="Link"
              />
            </Tooltip>
          </div>
        </div>
        <div key="manageFiles" className={highlightEditDiv} style={{ overflowY: "auto" }}>
          <ManageFiles checkTagsInUse={checkTagsInUse} saveAnnotations={saveAnnotations} />
        </div>
        <div key="document" className={highlightEditDiv} style={{ overflowY: "auto" }}>
          <div id="docDisplay" style={{ whiteSpace: "pre-wrap" }}>
            {renderCustomAnnotator()}
          </div>
        </div>
        <div key="legend" className={highlightEditDiv}>
          <Legend />
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    tagTemplates: state.fileViewer.tagTemplates,
    alertMessage: state.alert.alertMessage,
    isAuthorized: state.authentication.isAuthorized,
    isServerDown: state.authentication.isServerDown,
    isSpacyLoading: state.fileViewer.isSpacyLoading,
    initialTagsAdded: state.tagManagement.initialTagsAdded,
    sessionId: state.fileViewer.sessionId,
    linkedListAdd: state.fileViewer.linkedListAdd,
    snapToWord: state.fileViewer.snapToWord,
    currentEntities: state.fileViewer.currentEntities,
    currentSentences: state.fileViewer.currentSentences,
    fileIndex: state.fileViewer.fileIndex,
    annotationsList: state.fileViewer.annotationsList,
    userRole: state.authentication.userRole
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setTagTemplates: tagTemplates => dispatch(actions.setTagTemplates(tagTemplates)),
    setAlertMessage: newValue => dispatch(actions.setAlertMessage(newValue)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations)),
    setLinkedListAdd: linkedListAdd => dispatch(actions.setLinkedListAdd(linkedListAdd)),
    setInitialTagsAdded: initialTagsAdded => dispatch(actions.setInitialTagsAdded(initialTagsAdded)),
    setSessionId: sessionId => dispatch(actions.setSessionId(sessionId)),
    setSnapToWord: snapToWord => dispatch(actions.setSnapToWord(snapToWord))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Annotate);
