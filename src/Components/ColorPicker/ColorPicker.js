import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { SketchPicker } from "react-color";
import Icon from "@material-ui/core/Icon";
import AddBoxIcon from "@material-ui/icons/AddBox";
import Popover from "@material-ui/core/Popover";

const useStyles = makeStyles(theme => ({
  root: {
    "& > span": {
      margin: theme.spacing(2)
    }
  }
}));

const ColorPicker = props => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleColorChange = colorObj => {
    props.setColor(colorObj.hex);
  };

  const handleOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <React.Fragment>
      <Icon style={{ color: props.color }} onClick={handleOpen}>
        <AddBoxIcon />
      </Icon>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
      >
        <SketchPicker color={props.color} onChangeComplete={handleColorChange} />
      </Popover>
    </React.Fragment>
  );
};

export default ColorPicker;
