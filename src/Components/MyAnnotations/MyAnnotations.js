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
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

import PaginationFooter from "../Pagination/PaginationFooter";

const useStyles = makeStyles({
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
  const classes = useStyles();
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [data, setData] = useState([]);

  const [paginationSettings, setPaginationSettings] = useState({
    page: 1,
    pageSize: 2
  });

  const emptyRows = Math.max(rowsPerPage - data.length, 0);

  const handleChangePage = (event, command) => {
    switch (command) {
      case "first":
        getAnnotations("?size=" + rowsPerPage);
        break;
      case "prev":
        getAnnotations(paginationSettings.previous);
        break;
      case "next":
        getAnnotations(paginationSettings.next);
        break;
      case "last":
        getAnnotations("?size=" + rowsPerPage + "&page=" + paginationSettings.totalPage);
        break;
      default:
        break;
    }
  };

  const handleChangeRowsPerPage = pageSize => {
    setRowsPerPage(pageSize);
    // setPaginationSettings({ ...paginationSettings, pageSize });
    getAnnotations("?size=" + pageSize);
  };

  useEffect(() => {
    getAnnotations("?size=" + paginationSettings.pageSize);
  }, []);

  useEffect(() => {
    console.log(paginationSettings);
  }, [paginationSettings]);

  const getAnnotations = params => {
    console.log(params);
    APIUtility.API.makeAPICall(APIUtility.GET_ALL_ANNOTE_BY_CURRENT_USER, params)
      .then(response => response.json())
      .then(result => {
        setData(result.data);
        console.log(result);
        setPaginationSettings({
          page: result.page,
          pageSize: result.per_page,
          totalPage: result.total_pages,
          total: result.total,
          next: result.next,
          previous: result.previous
        });
      })
      .catch(error => {
        console.log("ERROR: ", error);
      });
  };

  const makeTableRowsHTML = () => {
    if (data == null || data.length === 0) {
      return;
    }

    const outputRows = [];
    for (let i = 0; i < Math.min(rowsPerPage, data.length); i++) {
      let row = data[i];
      let rowHTML = (
        <TableRow key={row.id}>
          <TableCell component="th" scope="row">
            {row.id}
          </TableCell>
          <TableCell align="right">{row.user}</TableCell>
          <TableCell align="right">{row.updated}</TableCell>
        </TableRow>
      );
      outputRows.push(rowHTML);
    }
    return outputRows;
  };

  return (
    <Paper className={classes.root}>
      <div className={classes.tableWrapper}>
        <Table className={classes.table} aria-label="My Annotation History">
          <TableBody>
            {makeTableRowsHTML()}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={5} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <PaginationFooter
                defaultPageSize={paginationSettings.pageSize}
                setPageSize={handleChangeRowsPerPage}
                page={paginationSettings.page}
                totalPage={paginationSettings.totalPage}
                onChangePage={handleChangePage}
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
