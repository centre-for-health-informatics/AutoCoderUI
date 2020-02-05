import React from "react";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";

const PaginationHeader = props => {
  const { headers, classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headers.map(headers => (
          <TableCell
            key={headers.id}
            align={headers.align}
            padding={headers.disablePadding ? "none" : "default"}
            sortDirection={orderBy === headers.id ? order : false}
          >
            {!headers.sortable && headers.label}
            {headers.sortable && (
              <TableSortLabel
                active={orderBy === headers.id}
                direction={orderBy === headers.id ? order : "asc"}
                onClick={createSortHandler(headers.id)}
              >
                {headers.label}
                {orderBy === headers.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === "desc" ? "sorted descending" : "sorted ascending"}
                  </span>
                ) : null}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default PaginationHeader;
