import React, { useState } from "react";
import { defaultLayouts } from "./layouts";
import { getFromLS, saveToLS } from "../../Util/layoutFunctions";
import { WidthProvider, Responsive } from "react-grid-layout";
import MenuBar from "../../Components/MenuBar/MenuBar";
import FileViewer from "../../Components/FileViewer/FileViewer";
import AnnotationEditor from "../../Components/CustomAnnotator/AnnotationEditor";

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
            <AnnotationEditor itemsToEdit={testItems} />
          </div>
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
}

export default Sandbox;
