import React, { useState, useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import * as actions from "../../Store/Actions/index";
import { connect } from "react-redux";
import * as APIUtility from "../../Util/API";
import * as utility from "../../Util/utility";
import { Button, Table, TableBody, TableCell, TableFooter, TableRow, Paper } from "@material-ui/core";
import downloader from "../../Util/download";
import PaginationFooter from "../Pagination/PaginationFooter";
import PaginationHeader from "../Pagination/PaginationHeader";
import { CloudDownload } from "@material-ui/icons";

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

// the id fields must match the model field references in backend for sorting to work
const tableHeaders = [
  { id: "id", align: "left", disablePadding: false, label: "Id" },
  { id: "filename", align: "left", disablePadding: false, label: "Filename" },
  { id: "updated", align: "left", disablePadding: false, label: "Time" },
  { id: "download", align: "left", disablePadding: false, label: "Download" }
];

const MyAnnotations = props => {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("id");

  const [paginationSettings, setPaginationSettings] = useState({
    page: 1,
    pageSize: 5
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

    if (options !== undefined) {
      if (options.hasOwnProperty("page")) {
        page = options["page"];
      }
      if (options.hasOwnProperty("pageSize")) {
        pageSize = options["pageSize"];
      }
      if (options.hasOwnProperty("order")) {
        sortOrder = options["order"];
      }
      if (options.hasOwnProperty("orderBy")) {
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

  const downloadAnnotations = index => {
    APIUtility.API.makeAPICall(APIUtility.DOWNLOAD_ANNOTATIONS_BY_ID, data[index].id)
      .then(response => response.json())
      .then(annotation => {
        let text = JSON.stringify(annotation[0]);

        console.log(annotation);

        downloader(annotation[0].name + "_Annotations.json", text);
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
          <TableCell align="right">{row.filename}</TableCell>
          <TableCell align="right">{utility.timeFormat(row.updated, false)}</TableCell>
          <TableCell align="right">
            <Button
              onClick={() => {
                downloadAnnotations(i);
              }}
              variant="contained"
              color="primary"
              className={classes.button}
            >
              Download
            </Button>
          </TableCell>
        </TableRow>
      );
      outputRows.push(rowHTML);
    }
    return outputRows;
  };

  return (
    <Paper className={classes.root} style={{ overflowY: "auto" }}>
      <div className={classes.tableWrapper} style={{ overflowY: "hidden" }}>
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
        </Table>
        <PaginationFooter
          totalItems={paginationSettings.total}
          defaultPageSize={paginationSettings.pageSize}
          setPageSize={handleChangeRowsPerPage}
          page={paginationSettings.page}
          totalPage={paginationSettings.totalPage}
          onChangePage={handleChangePage}
        />
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
