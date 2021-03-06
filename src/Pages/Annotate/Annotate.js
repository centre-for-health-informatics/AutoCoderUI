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
import Legend from "../../Components/Legend/Legend";
import LegendICD from "../../Components/Legend/LegendICD";
import ManageFiles from "../../Components/ManageFiles/ManageFiles";
import { mapColors, setDefaultTags } from "../../Components/TagManagement/tagUtil";
import { Switch, FormControlLabel, Tooltip, Tabs, Tab, Modal, Backdrop, Fade, Button } from "@material-ui/core";
import LoadingIndicator from "../../Components/LoadingIndicator/LoadingIndicator";
import CustomAnnotator from "../../Components/CustomAnnotator/CustomAnnotator";
import TreeViewer from "../../Components/TreeViewer/TreeViewer";
import SearchBox from "../../Components/TagManagement/SearchBox";
import { makeStyles } from "@material-ui/core/styles";
import useWindowResize from "../../Util/resizer";
import { getModalWidth } from "../../Util/utility";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("annotateLayouts", "layouts") || defaultLayouts;
const treeViewDiv = React.createRef();
const treeViewDivModal = React.createRef();

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const Annotate = (props) => {
  const [layouts, setLayouts] = useState(originalLayouts);
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [docTreeHeight, setDocTreeHeight] = useState(0);
  const [prevSpan, setPrevSpan] = useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const alert = useAlert();
  const classes = useStyles();

  const windowWidth = useWindowResize()[0];

  const onLayoutChange = (layouts) => {
    setLayouts(layouts);
    saveToLS("annotateLayouts", "layouts", layouts);
  };

  const onBreakPointChange = (newBreakpoint) => {
    const currentLayout = layouts[newBreakpoint];
    for (let i of currentLayout) {
      if (i.i === "document") {
        setDocTreeHeight(20 * (i.h - 2.9));
      }
    }
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
        },
      });
    }
  }, [props.alertMessage]);

  // checks the tags in use to generate a list for export, saving, etc.
  const checkTagsInUse = (annotation) => {
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
    return (
      <CustomAnnotator
        saveAnnotations={saveAnnotations}
        checkTagsInUse={checkTagsInUse}
        docTreeHeight={docTreeHeight}
        prevSpan={prevSpan}
        setPrevSpan={setPrevSpan}
        setModalOpen={setModalOpen}
        confirmAnnotation={confirmAnnotation}
      />
    );
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
      body: annotations,
    };

    // making the API call to save annotations
    APIUtility.API.makeAPICall(APIUtility.UPLOAD_ANNOTATIONS, null, options).catch((error) => {
      console.log("ERROR:", error);
    });
  };

  const handleTabChange = (event, index) => {
    if (index == 1) {
      document.getElementById("outerDiv").scrollTop = 0;
    }
    setSwipeIndex(index);
  };

  const changeAnnotation = () => {
    if (props.modifyingAnnotation && props.addingTags) {
      const tag = props.addingTags[0].id;

      const tagTemplates = Array.from(props.tagTemplates);
      let duplicateTag = tagTemplates.find(
        (tagTemplate) => tagTemplate.id === tag && tagTemplate.type === props.annotationFocus
      );
      if (duplicateTag === undefined) {
        tagTemplates.push({
          id: tag,
          type: props.annotationFocus,
          description: props.addingTags[0].description,
        });
      }

      // pushing the modified tagTemplates to the state and confirming annotation
      props.setTagTemplates(tagTemplates).then(() => {
        props.modifyingAnnotation.tag = props.addingTags[0].id;
        let current = props.modifyingAnnotation;
        while (current) {
          current.tag = props.addingTags[0].id;
          current = current.next;
        }
        setModalOpen(false);

        // necessary to update legend
        const focus = props.annotationFocus;
        props.setAnnotationFocus("");
        props.setAnnotationFocus(focus);

        confirmAnnotation(props.modifyingAnnotation);
      });
    }
  };

  // Refreshes editor to remove confirm button after it is clicked
  const refreshEditor = () => {
    const annotationsToEditCopy = Array.from(props.annotationsToEdit);
    props.setAnnotationsToEdit([]);
    props.setAnnotationsToEdit(annotationsToEditCopy);
  };

  const confirmAnnotation = (annotation) => {
    let current = annotation;
    while (current) {
      current.confirmed = true;
      current = current.next;
    }
    refreshEditor();
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
      <Modal
        className={classes.modal}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          props.setModifyingAnnotation(null);
        }}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          <div style={{ width: getModalWidth(windowWidth) }} className={classes.paper}>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <SearchBox />
              {props.modifyingAnnotation && (
                <Button
                  onClick={changeAnnotation}
                  variant="contained"
                  color="default"
                  className={classes.button}
                  size="small"
                  style={{ fontSize: "70%" }}
                >
                  Change
                </Button>
              )}
            </div>
            {props.annotationFocus === tagTypes.ICD ? (
              <div style={{ width: "90%", height: docTreeHeight ? docTreeHeight : 500 }}>
                <TreeViewer ref={treeViewDivModal} className="modalTree" />
              </div>
            ) : null}
          </div>
        </Fade>
      </Modal>
      <ResponsiveReactGridLayout
        className="layout"
        rowHeight={10}
        cols={{ lg: 48, md: 40, sm: 24, xs: 16, xxs: 8 }}
        layouts={layouts}
        draggableCancel="input,textarea"
        isDraggable={isLayoutModifiable}
        isResizable={isLayoutModifiable}
        onLayoutChange={(layout, layouts) => onLayoutChange(layouts)}
        onBreakpointChange={(newBreakpoint, newCols) => onBreakPointChange(newBreakpoint)}
      >
        <div key="tagSelector" className={highlightEditDiv} style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ flex: 4 }}>
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
                      if (prevSpan) {
                        props.setLinkedListAdd(!props.linkedListAdd);
                      }
                    }}
                  />
                }
                label="Link"
              />
            </Tooltip>
            {props.annotationFocus === tagTypes.ICD && (
              <Tooltip
                title={
                  "Enabling this will filter annotations to only show the currently selected code. Shortcut key: 'F'"
                }
              >
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      color="primary"
                      checked={props.filterICD}
                      onChange={() => {
                        // if turning it on, filter annotations
                        if (!props.filterICD) {
                          if (props.addingTags[0]) {
                            const newAnnotations = Array.from(props.annotations).filter(
                              (annotation) => annotation.tag === props.addingTags[0].id
                            );
                            props.setAnnotations(newAnnotations);
                          }
                        } else {
                          // turning it off
                          const newAnnotations = props.entities.filter(
                            (annotation) => annotation.type === tagTypes.ICD
                          );
                          props.setAnnotations(newAnnotations);
                        }
                        props.setFilterICD(!props.filterICD);
                      }}
                    />
                  }
                  label="Filter"
                />
              </Tooltip>
            )}
            <Button onClick={() => setModalOpen(true)} variant="contained" color="primary" className={classes.button}>
              Browse
            </Button>
          </div>
        </div>
        <div key="manageFiles" className={highlightEditDiv} style={{ overflowY: "auto" }}>
          <ManageFiles checkTagsInUse={checkTagsInUse} saveAnnotations={saveAnnotations} />
        </div>

        <div id="swipeDiv" key="document" className={highlightEditDiv}>
          <Tabs value={swipeIndex} onChange={handleTabChange}>
            <Tab label="Document" />
            <Tab label="Code Browser" />
          </Tabs>

          <div
            id="outerDiv"
            style={{
              overflowX: "hidden",
              overflowY: swipeIndex === 0 && props.fileViewerText !== "" ? "auto" : "hidden",
            }}
          >
            <div
              id="divWithComponents"
              style={{
                height: docTreeHeight ? docTreeHeight : 20 * (layouts.lg[2].h - 2.9),
                flexDirection: "row",
                direction: "ltr",
                display: "flex",
                willChange: "transform",
                transform: swipeIndex === 0 ? "translate(0%, 0)" : "translate(-100%, 0)",
                transition: "transform 0.35s cubic-bezier(0.15, 0.3, 0.25, 1) 0s",
              }}
            >
              <div style={{ width: "100%", flexShrink: 0, overflow: "visible" }}>{renderCustomAnnotator()}</div>
              <div style={{ width: "100%", flexShrink: 0, overflow: "visible" }}>
                <TreeViewer ref={treeViewDiv} className="mainTree" />
              </div>
            </div>
          </div>
        </div>

        <div key="legend" className={highlightEditDiv} style={{ overflowY: "auto" }}>
          {props.annotationFocus === tagTypes.ICD ? <LegendICD /> : <Legend />}
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    fileViewerText: state.fileViewer.fileViewerText,
    annotations: state.fileViewer.annotations,
    entities: state.fileViewer.entities,
    annotationFocus: state.fileViewer.annotationFocus,
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
    userRole: state.authentication.userRole,
    filterICD: state.fileViewer.filterICD,
    addingTags: state.tagManagement.addingTags,
    modifyingAnnotation: state.fileViewer.modifyingAnnotation,
    annotationsToEdit: state.fileViewer.annotationsToEdit,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setTagTemplates: (tagTemplates) => dispatch(actions.setTagTemplatesWithCallback(tagTemplates)),
    setFilterICD: (filterICD) => dispatch(actions.setFilterICD(filterICD)),
    setAlertMessage: (newValue) => dispatch(actions.setAlertMessage(newValue)),
    setAnnotationFocus: (annotationFocus) => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setAnnotations: (annotations) => dispatch(actions.setAnnotations(annotations)),
    setLinkedListAdd: (linkedListAdd) => dispatch(actions.setLinkedListAdd(linkedListAdd)),
    setInitialTagsAdded: (initialTagsAdded) => dispatch(actions.setInitialTagsAdded(initialTagsAdded)),
    setSessionId: (sessionId) => dispatch(actions.setSessionId(sessionId)),
    setSnapToWord: (snapToWord) => dispatch(actions.setSnapToWord(snapToWord)),
    setAnnotationsToEdit: (annotationsToEdit) => dispatch(actions.setAnnotationsToEdit(annotationsToEdit)),
    setModifyingAnnotation: (modifyingAnnotation) => dispatch(actions.setModifyingAnnotation(modifyingAnnotation)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Annotate);
