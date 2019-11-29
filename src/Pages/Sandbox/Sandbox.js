import React, { useState } from "react";
import { defaultLayouts } from "./layouts";
import { getFromLS, saveToLS } from "../../Util/layoutFunctions";
import { WidthProvider, Responsive } from "react-grid-layout";
import MenuBar from "../../Components/MenuBar/MenuBar";
import Button from "@material-ui/core/Button";
import AnnotationEditor from "../../Components/CustomAnnotator/AnnotationEditor";
import { makeStyles } from "@material-ui/core/styles";

import Popover from "@material-ui/core/Popover";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("sandboxLayouts", "layouts") || defaultLayouts;

const testItems = [
  { start: 188, end: 196, tag: "NEG_F" },
  { start: 1579, end: 1589, tag: "NEG_F", color: "#fcba03" },
  { start: 188, end: 196, tag: "CLOS_B", color: "#f277c3" },
  { start: 180, end: 192, tag: "NEG_B", color: "88f7af" }
];

function Sandbox(props) {
  const [layouts, setLayouts] = useState(originalLayouts);
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    // reset anchorEl
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    saveToLS("sandboxLayouts", "layouts", defaultLayouts);
  };

  function handleLayoutModifierButton() {
    const layoutModifiable = !isLayoutModifiable;
    setLayoutModifiable(layoutModifiable);
  }

  function onLayoutChange(layouts) {
    setLayouts(layouts);
    saveToLS("sandboxLayouts", "layouts", layouts);
  }

  const highlightEditDiv = isLayoutModifiable ? "grid-border edit-border" : "grid-border";

  return (
    <div>
      <div>
        <MenuBar
          title="Sandbox"
          tagsLink
          annotateLink
          handleLayoutConfirm={() => handleLayoutModifierButton()}
          handleResetLayout={resetLayout}
          inModifyMode={isLayoutModifiable}
        />
      </div>
      <ResponsiveReactGridLayout
        rowHeight={30}
        layouts={layouts}
        draggableCancel="input,textarea"
        isDraggable={isLayoutModifiable}
        isResizable={isLayoutModifiable}
        onLayoutChange={(layout, layouts) => onLayoutChange(layouts)}
      >
        <div key="0" className={highlightEditDiv}>
          <div className="cardContainer">
            <Button aria-describedby={id} variant="contained" color="primary" onClick={handleClick}>
              Open Popover
            </Button>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              // anchorReference="anchorPosition"
              // anchorPosition={{ top: 200, left: 400 }}
              anchorOrigin={{
                vertical: "top",
                horizontal: "center"
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "left"
              }}
            >
              <AnnotationEditor itemsToEdit={testItems} />
            </Popover>
          </div>
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
}

export default Sandbox;
