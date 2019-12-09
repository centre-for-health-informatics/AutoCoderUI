import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import { lighten } from "@material-ui/core/styles/colorManipulator";
import classNames from "classnames";
import { CsvBuilder } from "filefy";
import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "./tagTypes";

export class MTableToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columnsButtonAnchorEl: null,
      exportButtonAnchorEl: null
    };
    this.fileInputRef = React.createRef();
  }

  defaultExportCsv = () => {
    const columns = this.props.columns
      .filter(columnDef => {
        return !columnDef.hidden && columnDef.field && columnDef.export !== false;
      })
      .sort((a, b) => (a.tableData.columnOrder > b.tableData.columnOrder ? 1 : -1));
    const dataToExport = this.props.exportAllData ? this.props.data : this.props.renderData;
    const data = dataToExport.map(rowData =>
      columns.map(columnDef => {
        return this.props.getFieldValue(rowData, columnDef);
      })
    );

    const builder = new CsvBuilder((this.props.exportFileName || this.props.title || "data") + ".csv");
    builder
      .setDelimeter(this.props.exportDelimiter)
      .setColumns(columns.map(columnDef => columnDef.title))
      .addRows(data)
      .exportFile();
  };

  importCsv = () => {
    if (this.props.disabled) {
      return;
    }

    this.fileInputRef.current.click();
  };

  readFile = files => {
    if (files[0]) {
      let fileReader = new FileReader();
      fileReader.onload = e => {
        let lines = e.target.result.replace(/\r\n/g, "\n").split("\n");
        let tags = this.readTagsFromStrings(lines);
        this.props.setTagTemplates(tags);
      };

      fileReader.readAsText(files[0]);
    }
  };

  readTagsFromStrings = lines => {
    const oldTags = Array.from(this.props.tagTemplates);
    const newTags = [];
    const descriptionUpdated = [];
    const colorUpdated = [];
    const typeUpdated = [];

    for (let i = 0; i < lines.length; i++) {
      const items = lines[i].split(",");

      const id = items[0];
      let description = items[1];
      let color = items[2];
      let type = items[3];

      description = this.cleanInput(description, id);
      color = this.cleanInput(color, "");
      type = this.cleanInput(type, tagTypes.ENTITIES);

      if (id !== "") {
        // line is not empty

        let duplicateTag = oldTags.find(tag => tag.id === id);

        if (duplicateTag !== undefined) {
          // tag id already exist in oldTags

          if (description !== duplicateTag.description) {
            // description update
            duplicateTag.description = description;
            descriptionUpdated.push(duplicateTag);
          }
        } else {
          // the tag does not exist in oldTags
          oldTags.push({ id, description, color, type });
          newTags.push({ id, description, color, type });
        }
      }
    }
    return oldTags;
  };

  cleanInput = (value, defaultValue) => {
    if (value !== undefined) {
      // Remove start and end white spaces
      value = value.trim();

      // Remove start and end quotes
      if (value[0] === '"' && value[-1] === '"') {
        value = value[(1, -1)];
      }
    } else {
      value = defaultValue;
    }
    return value;
  };

  exportCsv = () => {
    if (this.props.exportCsv) {
      this.props.exportCsv(this.props.columns, this.props.data);
    } else {
      this.defaultExportCsv();
    }
    this.setState({ exportButtonAnchorEl: null });
  };

  renderSearch = () => {
    const localization = { ...MTableToolbar.defaultProps.localization, ...this.props.localization };
    if (this.props.search) {
      return (
        <TextField
          className={
            this.props.searchFieldAlignment === "left" && this.props.showTitle === false
              ? null
              : this.props.classes.searchField
          }
          value={this.props.searchText}
          onChange={event => this.props.onSearchChanged(event.target.value)}
          placeholder={localization.searchPlaceholder}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Tooltip title={localization.searchTooltip}>
                  <this.props.icons.Search color="inherit" fontSize="small" />
                </Tooltip>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton disabled={!this.props.searchText} onClick={() => this.props.onSearchChanged("")}>
                  <this.props.icons.ResetSearch color="inherit" fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            style: this.props.searchFieldStyle
          }}
        />
      );
    } else {
      return null;
    }
  };

  renderDefaultActions = () => {
    const localization = { ...MTableToolbar.defaultProps.localization, ...this.props.localization };
    const { classes } = this.props;

    return (
      <div>
        {this.props.columnsButton && (
          <span>
            <Tooltip title={localization.showColumnsTitle}>
              <IconButton
                color="inherit"
                onClick={event => this.setState({ columnsButtonAnchorEl: event.currentTarget })}
                aria-label={localization.showColumnsAriaLabel}
              >
                <this.props.icons.ViewColumn />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={this.state.columnsButtonAnchorEl}
              open={Boolean(this.state.columnsButtonAnchorEl)}
              onClose={() => this.setState({ columnsButtonAnchorEl: null })}
            >
              <MenuItem key={"text"} disabled style={{ opacity: 1, fontWeight: 600, fontSize: 12 }}>
                {localization.addRemoveColumns}
              </MenuItem>
              {this.props.columns.map(col => {
                return (
                  <li key={col.tableData.id}>
                    <MenuItem
                      className={classes.formControlLabel}
                      component="label"
                      htmlFor={`column-toggle-${col.tableData.id}`}
                      disabled={col.removable === false}
                    >
                      <Checkbox
                        checked={!col.hidden}
                        id={`column-toggle-${col.tableData.id}`}
                        onChange={() => this.props.onColumnsChanged(col, !col.hidden)}
                      />
                      <span>{col.title}</span>
                    </MenuItem>
                  </li>
                );
              })}
            </Menu>
          </span>
        )}
        {this.props.exportButton && (
          <span>
            <Tooltip title={localization.exportTitle}>
              <IconButton
                color="inherit"
                onClick={event => this.setState({ exportButtonAnchorEl: event.currentTarget })}
                aria-label={localization.exportAriaLabel}
              >
                <this.props.icons.Export />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={this.state.exportButtonAnchorEl}
              open={Boolean(this.state.exportButtonAnchorEl)}
              onClose={() => this.setState({ exportButtonAnchorEl: null })}
            >
              <MenuItem key="export-csv" onClick={this.exportCsv}>
                {localization.exportName}
              </MenuItem>
            </Menu>
          </span>
        )}
        <span>
          <this.props.components.Actions
            actions={this.props.actions && this.props.actions.filter(a => a.position === "toolbar")}
            components={this.props.components}
          />
        </span>
      </div>
    );
  };

  renderSelectedActions = () => {
    return (
      <React.Fragment>
        <this.props.components.Actions
          actions={this.props.actions.filter(a => a.position === "toolbarOnSelect")}
          data={this.props.selectedRows}
          components={this.props.components}
        />
      </React.Fragment>
    );
  };

  renderActions = () => {
    const { classes } = this.props;

    return (
      <div className={classes.actions}>
        <div>
          {this.props.selectedRows && this.props.selectedRows.length > 0
            ? this.renderSelectedActions()
            : this.renderDefaultActions()}
        </div>
      </div>
    );
  };

  renderToolbarTitle = title => {
    const { classes } = this.props;
    const toolBarTitle = typeof title === "string" ? <Typography variant="h6">{title}</Typography> : title;

    return <div className={classes.title}>{toolBarTitle}</div>;
  };

  renderUploadCSV = () => {
    return (
      <Tooltip title={"Upload tags"}>
        <div>
          <IconButton color="inherit" onClick={this.importCsv} aria-label={"Upload tags"}>
            <this.props.icons.Upload />
          </IconButton>
          <input
            ref={this.fileInputRef}
            style={{ display: "none" }}
            type="file"
            onChange={e => this.readFile(e.target.files)}
          />
        </div>
      </Tooltip>
    );
  };

  handleShowFilters = () => {
    this.props.setShowFilters(!this.props.showFilters);
  };

  renderShowFilters = () => {
    return (
      <Tooltip title={"Show/hide filters"}>
        <IconButton color="inherit" onClick={this.handleShowFilters} aria-label={"Show/hide filters"}>
          <this.props.icons.Search />
        </IconButton>
      </Tooltip>
    );
  };

  render() {
    const { classes } = this.props;
    const localization = { ...MTableToolbar.defaultProps.localization, ...this.props.localization };
    const title =
      this.props.showTextRowsSelected && this.props.selectedRows && this.props.selectedRows.length > 0
        ? localization.nRowsSelected.replace("{0}", this.props.selectedRows.length)
        : this.props.showTitle
        ? this.props.title
        : null;
    return (
      <Toolbar
        className={classNames(classes.root, {
          [classes.highlight]:
            this.props.showTextRowsSelected && this.props.selectedRows && this.props.selectedRows.length > 0
        })}
      >
        {title && this.renderToolbarTitle(title)}
        {this.props.searchFieldAlignment === "left" && this.renderSearch()}
        {this.props.toolbarButtonAlignment === "left" && this.renderActions()}
        <div className={classes.spacer} />
        {this.renderShowFilters()}
        {this.renderUploadCSV()}
        {this.props.searchFieldAlignment === "right" && this.renderSearch()}
        {this.props.toolbarButtonAlignment === "right" && this.renderActions()}
      </Toolbar>
    );
  }
}

MTableToolbar.defaultProps = {
  actions: [],
  columns: [],
  columnsButton: false,
  localization: {
    addRemoveColumns: "Add or remove columns",
    nRowsSelected: "{0} row(s) selected",
    showColumnsTitle: "Show Columns",
    showColumnsAriaLabel: "Show Columns",
    exportTitle: "Export",
    exportAriaLabel: "Export",
    exportName: "Export as CSV",
    searchTooltip: "Search",
    searchPlaceholder: "Search"
  },
  search: true,
  showTitle: true,
  showTextRowsSelected: true,
  toolbarButtonAlignment: "right",
  searchFieldAlignment: "right",
  searchText: "",
  selectedRows: [],
  title: "No Title!"
};

MTableToolbar.propTypes = {
  actions: PropTypes.array,
  columns: PropTypes.array,
  columnsButton: PropTypes.bool,
  components: PropTypes.object.isRequired,
  getFieldValue: PropTypes.func.isRequired,
  localization: PropTypes.object.isRequired,
  onColumnsChanged: PropTypes.func.isRequired,
  onSearchChanged: PropTypes.func.isRequired,
  search: PropTypes.bool.isRequired,
  searchFieldStyle: PropTypes.object,
  searchText: PropTypes.string.isRequired,
  selectedRows: PropTypes.array,
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  showTitle: PropTypes.bool.isRequired,
  showTextRowsSelected: PropTypes.bool.isRequired,
  toolbarButtonAlignment: PropTypes.string.isRequired,
  searchFieldAlignment: PropTypes.string.isRequired,
  renderData: PropTypes.array,
  data: PropTypes.array,
  exportAllData: PropTypes.bool,
  exportButton: PropTypes.bool,
  exportDelimiter: PropTypes.string,
  exportFileName: PropTypes.string,
  exportCsv: PropTypes.func,
  classes: PropTypes.object
};

export const styles = theme => ({
  root: {
    paddingRight: theme.spacing(1)
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85)
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark
        },
  spacer: {
    flex: "1 1 10%"
  },
  actions: {
    color: theme.palette.text.secondary
  },
  title: {
    flex: "0 0 auto"
  },
  searchField: {
    paddingLeft: theme.spacing(2)
  },
  formControlLabel: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  }
});

const mapStateToProps = state => {
  return {
    tagTemplates: state.fileViewer.tagTemplates
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setTagTemplates: tags => dispatch(actions.setTagTemplatesWithCallback(tags))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MTableToolbar));
