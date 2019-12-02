import React from "react";
import { connect } from "react-redux";

const Legend = props => {











    return (
        // something
    )


}

const mapStateToProps = state => {
    return {
    //   fileViewerText: state.fileViewer.fileViewerText,
    //   annotations: state.fileViewer.annotations,
    //   tagTemplates: state.fileViewer.tagTemplates,
    //   annotationFocus: state.fileViewer.annotationFocus, // the currently active type
    //   addingTags: state.tagManagement.addingTags, // the currently active tag
    //   sections: state.fileViewer.sections,
    //   sentences: state.fileViewer.sentences,
    //   tokens: state.fileViewer.tokens,
    //   entities: state.fileViewer.entities
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
    //   setAddingTags: tags => dispatch(actions.setAddingTags(tags)),
    //   setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    //   setAnnotations: annotations => dispatch(actions.setAnnotations(annotations))
    };
  };
  
  export default connect(mapStateToProps, mapDispatchToProps)(Legend);
  