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
import TagUploader from "../../Components/TagManagement/TagUploader";
import * as APIUtility from "../../Util/API";
import TagViewer from "../../Components/TagManagement/TagViewer";
import GeneralSettings from "../../Components/GeneralSettings/GeneralSettings";
import TagExplorer from "../../Components/TagManagement/TagExplorer";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("tagsLayouts", "layouts") || defaultLayouts;

const Tags = props => {
  const [layouts, setLayouts] = useState(originalLayouts);
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const alert = useAlert();

  const onLayoutChange = layouts => {
    setLayouts(layouts);
    saveToLS("tagsLayouts", "layouts", layouts);
  };

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    saveToLS("tagsLayouts", "layouts", defaultLayouts);
  };

  const handleLayoutModifierButton = () => {
    const layoutModifiable = !isLayoutModifiable;
    setLayoutModifiable(layoutModifiable);
  };

  const highlightEditDiv = isLayoutModifiable ? "grid-border edit-border" : "grid-border";

  // Verify token
  useEffect(() => {
    APIUtility.API.verifyLSToken(() => setIsLoading(false));
  }, []);

  // // Display alert message
  useEffect(() => {
    if (props.alertMessage) {
      alert.show(props.alertMessage.message, {
        timeout: 5000,
        position: positions.MIDDLE,
        type: props.alertMessage.messageType
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.alertMessage]);

  if (isLoading) {
    return <Loading />;
  }

  if (props.isServerDown) {
    return <Redirect to="/server-down" />;
  }

  // if (!props.isAuthorized) {
  //   return <Redirect to="/sign-in" />;
  // }

  return (
    <div>
      <div>
        <MenuBar
          title="Manage Tags"
          annotateLink
          sandboxLink
          handleLayoutConfirm={() => handleLayoutModifierButton()}
          handleResetLayout={resetLayout}
          inModifyMode={isLayoutModifiable}
        />
      </div>
      <ResponsiveReactGridLayout
        className="layout"
        rowHeight={10}
        layouts={layouts}
        draggableCancel="input,textarea"
        isDraggable={isLayoutModifiable}
        isResizable={isLayoutModifiable}
        onLayoutChange={(layout, layouts) => onLayoutChange(layouts)}
      >
        <div key="tagUploader" className={highlightEditDiv}>
          <TagUploader />
        </div>
        <div key="tagList" className={highlightEditDiv}>
          {/* <TagViewer /> */}
          <TagExplorer />
        </div>
        <div key="generalSettings" className={highlightEditDiv}>
          <GeneralSettings />
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    alertMessage: state.alert.alertMessage
    // isAuthorized: state.authentication.isAuthorized,
    // isServerDown: state.authentication.isServerDown
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setAlertMessage: newValue => dispatch(actions.setAlertMessage(newValue))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Tags);
