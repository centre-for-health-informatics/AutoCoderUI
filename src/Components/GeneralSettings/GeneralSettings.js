import React from "react";
import { connect } from "react-redux";
import { Switch, FormControlLabel } from "@material-ui/core";
import * as actions from "../../Store/Actions/index";

const GeneralSettings = props => {
  const handleUseSpacyChange = () => {
    // if (!props.spacyActive && props.textToDisplay !== "") {
    //   callApi();
    // }
    props.setSpacyActive(!props.spacyActive);
  };

  return (
    <FormControlLabel
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
