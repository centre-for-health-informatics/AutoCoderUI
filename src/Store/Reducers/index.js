import { combineReducers } from "redux";
import alert from "./alert";
import authentication from "./authentication";
import fileViewer from "./fileViewer";
import tagManagement from "./tagManagement";
import cached from "./cached";

export default combineReducers({
  alert,
  authentication,
  fileViewer,
  tagManagement,
  cached
});
