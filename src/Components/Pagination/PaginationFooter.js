import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Slider from "@material-ui/core/Slider";
import { Typography } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 0,
    flexShrink: 0,
    width: "100%"
  },
  paginationItem: {
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary
  }
}));

const PaginationFooter = props => {
  const classes = useStyles();

  const onPageSizeChange = (e, v) => {
    props.setPageSize(v);
  };

  const handleFirstPageButtonClick = event => {
    props.onChangePage(event, "first");
  };

  const handleBackButtonClick = event => {
    props.onChangePage(event, "prev");
  };

  const handleNextButtonClick = event => {
    props.onChangePage(event, "next");
  };

  const handleLastPageButtonClick = event => {
    props.onChangePage(event, "last");
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <div className={classes.paginationItem}>Rows per Page: </div>
        </Grid>
        <Grid item xs={3}>
          <div className={classes.paginationItem}>
            <Slider
              onChangeCommitted={onPageSizeChange}
              defaultValue={props.defaultPageSize}
              aria-labelledby="page-size-slider"
              valueLabelDisplay="auto"
              step={1}
              min={1}
              max={Math.min(100, props.totalItems)}
              valueLabelDisplay="auto"
            />
          </div>
        </Grid>
        <Grid item xs={2}>
          <div className={classes.paginationItem}>
            <Typography>
              Page {props.page} of {props.totalPage}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={4}>
          <IconButton onClick={handleFirstPageButtonClick} disabled={props.page === 1} aria-label="first page">
            <FirstPageIcon />
          </IconButton>
          <IconButton onClick={handleBackButtonClick} disabled={props.page === 1} aria-label="previous page">
            <KeyboardArrowLeft />
          </IconButton>
          <IconButton onClick={handleNextButtonClick} disabled={props.page === props.totalPage} aria-label="next page">
            <KeyboardArrowRight />
          </IconButton>
          <IconButton
            onClick={handleLastPageButtonClick}
            disabled={props.page === props.totalPage}
            aria-label="last page"
          >
            <LastPageIcon />
          </IconButton>
        </Grid>
      </Grid>
    </div>
  );
};

export default PaginationFooter;
