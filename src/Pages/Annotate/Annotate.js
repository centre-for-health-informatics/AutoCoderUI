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
import TagSelector from "../../Components/TagManagement/TagSelector";
import FileViewer from "../../Components/FileViewer/FileViewer";
import Legend from "../../Components/CustomAnnotator/Legend";
import ImportExportAnnotations from "../../Components/ImportExportAnnotations/ImportExportAnnotations";

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

  // Verify token
  // useEffect(() => {
  //   APIUtility.API.verifyLSToken(() => setIsLoading(false));
  // }, []);

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

  // if (isLoading) {
  //   return <Loading />;
  // }

  // if (props.isServerDown) {
  //   return <Redirect to="/server-down" />;
  // }

  // if (!props.isAuthorized) {
  //   return <Redirect to="/sign-in" />;
  // }

  return (
    <div>
      <div>
        <MenuBar
          title="Annotate"
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
        <div key="tagSelector" className={highlightEditDiv}>
          <TagSelector />
        </div>
        <div key="import-export" className={highlightEditDiv}>
          <ImportExportAnnotations />
        </div>
        <div key="document" className={highlightEditDiv} style={{ overflowY: "auto" }}>
          <FileViewer />
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

export default connect(mapStateToProps, mapDispatchToProps)(Annotate);
