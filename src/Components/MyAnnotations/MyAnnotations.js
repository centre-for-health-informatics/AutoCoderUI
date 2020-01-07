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
import PaginationHeader from "../Pagination/PaginationHeader";

const useStyles = makeStyles({
  root: {
    width: "100%"
  },
  table: {
    minWidth: 500
  },
  tableWrapper: {
    overflowX: "auto"
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1
  }
});

const tableHeaders = [
  { id: "id", align: "left", disablePadding: false, label: "Id" },
  { id: "user", align: "left", disablePadding: false, label: "User" },
  { id: "time", align: "left", disablePadding: false, label: "Last updated" }
];

const MyAnnotations = props => {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("id");

  const [paginationSettings, setPaginationSettings] = useState({
    page: 1,
    pageSize: 3
  });

  const emptyRows = Math.max(paginationSettings.pageSize - data.length, 0);

  const handleChangePage = (event, command) => {
    switch (command) {
      case "first":
        getAnnotations({ page: 1 });
        break;
      case "prev":
        getAnnotations({ page: paginationSettings.page - 1 });
        break;
      case "next":
        getAnnotations({ page: paginationSettings.page + 1 });
        break;
      case "last":
        getAnnotations({ page: paginationSettings.totalPage });
        break;
      default:
        break;
    }
  };

  /**
   * Called on to sort by column
   */
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    getAnnotations({ order: isAsc ? "desc" : "asc", orderBy: property });
  };

  /**
   * Called on to change rows per page
   */
  const handleChangeRowsPerPage = pageSize => {
    getAnnotations({ pageSize });
  };

  /**
   * When page first loads
   */
  useEffect(() => {
    getAnnotations();
  }, []);

  // useEffect(() => {
  //   console.log(paginationSettings);
  // }, [paginationSettings]);

  /**
   * Receives a dictionary with key-value for parameters, returns a string to be attached to API URL
   */
  const makeRequestParams = options => {
    let page = paginationSettings.page;
    let pageSize = paginationSettings.pageSize;
    let sortOrder = order;
    let orderByProperty = orderBy;

    if (!(options == null)) {
      if ("page" in options) {
        page = options["page"];
      }
      if ("pageSize" in options) {
        pageSize = options["pageSize"];
      }
      if ("order" in options) {
        sortOrder = options["order"];
      }
      if ("orderBy" in options) {
        orderByProperty = options["orderBy"];
      }
    }

    return "?page=" + page + "&size=" + pageSize + "&orderBy=" + orderByProperty + "&order=" + sortOrder;
  };

  /**
   * Called on to request table data
   */
  const getAnnotations = params => {
    const paramString = makeRequestParams(params);
    APIUtility.API.makeAPICall(APIUtility.GET_ALL_ANNOTE_BY_CURRENT_USER, paramString)
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
    for (let i = 0; i < Math.min(paginationSettings.pageSize, data.length); i++) {
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
          <PaginationHeader
            headers={tableHeaders}
            onRequestSort={handleRequestSort}
            order={order}
            orderBy={orderBy}
            classes={classes}
          />
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
