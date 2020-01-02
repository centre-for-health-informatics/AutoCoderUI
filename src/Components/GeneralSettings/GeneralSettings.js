import React from "react";
import { connect } from "react-redux";
import { Switch, FormControlLabel } from "@material-ui/core";
import * as actions from "../../Store/Actions/index";

const GeneralSettings = props => {
  // changes whether spacy is active or not
  const handleUseSpacyChange = () => {
    props.setSpacyActive(!props.spacyActive);
  };

  return (
    <FormControlLabel
      style={{ paddingLeft: 10 }}
      control={<Switch size="small" color="primary" checked={props.spacyActive} onChange={handleUseSpacyChange} />}
      label="Use Spacy"
    />
  );
};

const mapStateToProps = state => {
  return {
    spacyActive: state.fileViewer.spacyActive
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setSpacyActive: spacyActive => dispatch(actions.setSpacyActive(spacyActive))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GeneralSettings);
