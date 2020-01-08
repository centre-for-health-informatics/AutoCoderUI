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
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import LoadingIndicator from "../../Components/LoadingIndicator/LoadingIndicator";
import MyAnnotations from "../../Components/MyAnnotations/MyAnnotations";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("projectLayouts", "layouts") || defaultLayouts;

const ProjectOverview = props => {
  const [layouts, setLayouts] = useState(originalLayouts);
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const alert = useAlert();

  const onLayoutChange = layouts => {
    setLayouts(layouts);
    saveToLS("projectLayouts", "layouts", layouts);
  };

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    saveToLS("projectLayouts", "layouts", defaultLayouts);
  };

  const handleLayoutModifierButton = () => {
    const layoutModifiable = !isLayoutModifiable;
    setLayoutModifiable(layoutModifiable);
  };

  const highlightEditDiv = isLayoutModifiable ? "grid-border edit-border" : "grid-border";

  // ComponentDidMount
  useEffect(() => {
    setLayouts(getFromLS("projectLayouts", "layouts") || defaultLayouts);
    APIUtility.API.verifyLSToken(() => setIsLoading(false));
  }, []);

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

  if (isLoading) {
    return <Loading />;
  }

  // if (props.isServerDown) {
  //   return <Redirect to="/server-down" />;
  // }

  if (!props.isAuthorized) {
    return <Redirect to="/sign-in" />;
  }

  return (
    <div>
      <div>
        <MenuBar
          title="Project"
          annotateLink
          tagsLink
          sandboxLink
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
        <div key="annotationsList" className={highlightEditDiv} style={{ display: "flex", flexDirection: "row" }}>
          <MyAnnotations />
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
    snapToWord: state.fileViewer.snapToWord
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

export default connect(mapStateToProps, mapDispatchToProps)(ProjectOverview);
