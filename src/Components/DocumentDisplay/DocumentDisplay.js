import React, { Component } from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../../Components/LoadingIndicator/LoadingIndicator";
import CustomAnnotator from "../../Components/CustomAnnotator/CustomAnnotator";

class DocumentDisplay extends Component {
  constructor(props) {
    super(props);
  }

  renderCustomAnnotator = () => {
    if (this.props.spacyLoading) {
      return <LoadingIndicator />;
    }
    return <CustomAnnotator />;
  };

  render() {
    return (
      <div id="docDisplay" style={{ whiteSpace: "pre-wrap" }}>
        {this.renderCustomAnnotator()}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    spacyLoading: state.fileViewer.spacyLoading
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DocumentDisplay);
