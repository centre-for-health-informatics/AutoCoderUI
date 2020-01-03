import React, { useState, useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import * as actions from "../../Store/Actions/index";
import { connect } from "react-redux";
import * as APIUtility from "../../Util/API";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";

const useStyles1 = makeStyles(theme => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5)
  }
}));

function TablePaginationActions(props) {
  const classes = useStyles1();
  const theme = useTheme();
  const { totalPage, page, rowsPerPage, onChangePage } = props;

  const handleFirstPageButtonClick = event => {
    onChangePage(event, "first");
  };

  const handleBackButtonClick = event => {
    onChangePage(event, "prev");
  };

  const handleNextButtonClick = event => {
    onChangePage(event, "next");
  };

  const handleLastPageButtonClick = event => {
    onChangePage(event, "last");
  };

  return (
    <div className={classes.root}>
      <IconButton onClick={handleFirstPageButtonClick} disabled={page === 1} aria-label="first page">
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 1} aria-label="previous page">
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton onClick={handleNextButtonClick} disabled={page === totalPage} aria-label="next page">
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton onClick={handleLastPageButtonClick} disabled={page === totalPage} aria-label="last page">
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired
};

const useStyles2 = makeStyles({
  root: {
    width: "100%"
  },
  table: {
    minWidth: 500
  },
  tableWrapper: {
    overflowX: "auto"
  }
});

const MyAnnotations = props => {
  const classes = useStyles2();
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [data, setData] = useState([]);

  const [paginationSettings, setPaginationSettings] = useState({
    page: 1,
    pageSize: 2
  });

  const emptyRows =
    paginationSettings.pageSize -
    Math.min(paginationSettings.pageSize, data.length - paginationSettings.page * paginationSettings.pageSize);

  const handleChangePage = (event, command) => {
    switch (command) {
      case "first":
        getAnnotations();
        break;
      case "prev":
        getAnnotations(paginationSettings.previous);
        break;
      case "next":
        getAnnotations(paginationSettings.next);
        break;
      case "last":
        getAnnotations("?size=" + paginationSettings.pageSize + "&page=" + paginationSettings.totalPage);
        break;
      default:
        break;
    }
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPaginationSettings({ ...paginationSettings, pageSize: parseInt(event.target.value, 10) });
  };

  useEffect(() => {
    getAnnotations("?size=" + paginationSettings.pageSize);
  }, []);

  const getAnnotations = params => {
    APIUtility.API.makeAPICall(APIUtility.GET_ALL_ANNOTE_BY_CURRENT_USER, params)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        setData(result.data);
        setPaginationSettings({
          page: result.page,
          pageSize: result.per_page,
          totalPage: result.total_pages,
          total: result.total,
          next: result.next,
          previous: result.previous
        });
        // setRowsPerPage(result.per_page);
        // setPage(result.page);
      })
      .catch(error => {
        console.log("ERROR: ", error);
      });
  };

  return (
    <Paper className={classes.root}>
      <div className={classes.tableWrapper}>
        <Table className={classes.table} aria-label="My Annotation History">
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">
                  {row.id}
                </TableCell>
                <TableCell align="right">{row.user}</TableCell>
                <TableCell align="right">{row.updated}</TableCell>
              </TableRow>
            ))}

            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={5} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={3}
                count={paginationSettings.totalPage}
                rowsPerPage={paginationSettings.pageSize}
                page={paginationSettings.page}
                SelectProps={{
                  inputProps: { "aria-label": "rows per page" },
                  native: true
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </Paper>
  );
};

const mapStateToProps = state => {
  return {
    tagTemplates: state.fileViewer.tagTemplates,
    entities: state.fileViewer.entities,
    sections: state.fileViewer.sections
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setTagTemplates: tags => dispatch(actions.setTagTemplatesWithCallback(tags)),
    setSections: sections => dispatch(actions.setSections(sections)),
    setEntities: entities => dispatch(actions.setEntities(entities)),
    setAlertMessage: newValue => dispatch(actions.setAlertMessage(newValue))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyAnnotations);
