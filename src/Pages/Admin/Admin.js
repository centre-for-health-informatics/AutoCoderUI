import React, { useState, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import { defaultLayouts } from "./layouts";
import MenuBar from "../../Components/MenuBar/MenuBar";
import * as actions from "../../Store/Actions/index";
import { getFromLS, saveToLS } from "../../Util/layoutFunctions";
import { connect } from "react-redux";
import Loading from "../Loading/Loading";
import * as APIUtility from "../../Util/API";
import { Redirect } from "react-router";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import UserAnnotations from "../../Components/UserAnnotations/UserAnnotations";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("adminLayouts", "layouts") || defaultLayouts;

const Admin = props => {
  const [layouts, setLayouts] = useState(originalLayouts);
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const onLayoutChange = layouts => {
    setLayouts(layouts);
    saveToLS("adminLayouts", "layouts", layouts);
  };

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    saveToLS("adminLayouts", "layouts", defaultLayouts);
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

  if (isLoading) {
    return <Loading />;
  }

  if (!props.isAuthorized) {
    return <Redirect to="/sign-in" />;
  }

  return (
    <div>
      <div>
        <MenuBar
          title="Admin"
          annotateLink
          tagsLink
          projectLink
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
          <UserAnnotations user="admin" />
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    isAuthorized: state.authentication.isAuthorized
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
