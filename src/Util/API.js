import store from "../Store/configureStore";
import * as actions from "../Store/Actions/index";

// ENDPOINTS----------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
export const GET_TOKEN = "GET_TOKEN";
export const CREATE_USER = "CREATE_USER";
export const VALIDATE_TOKEN = "VALIDATE_TOKEN";
export const FORGOT_PASSWORD = "FORGOT_PASSWORD";
export const RESET_PASSWORD = "RESET_PASSWORD";
export const UPLOAD_DOCUMENT = "UPLOAD_DOCUMENT";
export const UPLOAD_ANNOTATIONS = "UPLOAD_ANNOTATIONS";
export const GET_ALL_ANNOTE_BY_CURRENT_USER = "GET_ALL_ANNOTE_BY_CURRENT_USER";
export const GET_ALL_ANNOTE = "GET_ALL_ANNOTE";
export const GET_ANNOTATIONS_FILENAME_USER = "GET_ANNOTATIONS_FILENAME_USER";
export const EXPORT_CURRENT_ANNOTATIONS = "EXPORT_CURRENT_ANNOTATIONS";
export const DOWNLOAD_ANNOTATIONS_BY_ID = "DOWNLOAD_ANNOTATIONS_BY_ID";

// ICD APIs
export const ANCESTORS = "ANCESTORS";
export const FAMILY = "FAMILY";
export const CODE_AUTO_SUGGESTIONS = "CODE_AUTO_SUGGESTIONS";
export const CODE_DESCRIPTION = "CODE_DESCRIPTION";

/**
 * API class used to connect to the backend
 * Deals with token authorization and all other API calls
 */
export class API {
  static serverAdress = process.env.REACT_APP_SERVER_ADDRESS; //window.location.hostname; //Only if API on same server as React
  static urlBeginning = this.serverAdress + "/api/";
  static authUrlBeginning = this.serverAdress + "/o/";
  static json = "/?format=json";

  // MISCELLANEOUS HELPER METHODS--------------------------------------------------------
  //-------------------------------------------------------------------------------------
  /**
   * Method used to remove the user related store values from the store
   */
  static _revokeUserAuthorizationFromStore() {
    store.dispatch(actions.setIsAuthorized(false));
    store.dispatch(actions.setUserRole(null));
  }

  // METHODS DEALING WITH TOKENS---------------------------------------------------------
  //-------------------------------------------------------------------------------------

  /**
   * Helper method used to make the get token API call and handle the response
   */
  static _handleGetTokenAPICall(options) {
    this.makeAPICall(GET_TOKEN, null, options)
      .then(response => response.json())
      .then(response => {
        if (response.access_token !== undefined) {
          // revoking old token if it exists
          const localStorageToken = this.getTokenFromLS();
          const url = this.authUrlBeginning + "revoke_token/";
          const data = { token: localStorageToken, client_id: process.env.REACT_APP_CLIENT_ID };
          const options = {
            headers: {
              "Content-Type": "application/json"
            },
            method: "POST",
            body: data
          };

          this._fetchFromAPI(url, options);

          // setting new token into local storage
          localStorage.setItem("tokenObject", JSON.stringify(response));
          store.dispatch(actions.setUserRole(response.user.role));
          store.dispatch(actions.setIsAuthorized(true));
        } else {
          store.dispatch(actions.setAlertMessage({ message: "Invalid username or password", messageType: "error" }));
        }
      })
      .catch(error => {
        console.log("[ERROR GETTING TOKEN]", error);
      });
  }

  /**
   * Used to request a token from the backend server and handle the response
   */
  static getTokenFromAPI(username, password) {
    const body = {
      username: username,
      password: password,
      grant_type: "password"
    };
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const options = {
      method: "POST",
      headers: headers,
      body: body
    };

    this._handleGetTokenAPICall(options);
  }

  /**
   * Retrieves the saved token from the local storage. If the local storage does not
   * contain the token, returns -1
   */
  static getTokenFromLS() {
    const localStorageToken = localStorage.getItem("tokenObject");
    if (localStorageToken !== "" && localStorageToken !== null) {
      return JSON.parse(localStorageToken).access_token;
    } else {
      return -1;
    }
  }

  /**
   * Used to verify the validity of the token stored in local storage
   */
  static verifyLSToken = callBackFunction => {
    this.makeAPICall(VALIDATE_TOKEN)
      .then(response => {
        if (response.status === 200) {
          store.dispatch(actions.setIsAuthorized(true));
          store.dispatch(actions.setUserRole(JSON.parse(localStorage.getItem("tokenObject")).user.role));
        }
        store.dispatch(actions.setIsServerDown(false));
        callBackFunction();
      })
      .catch(err => {
        callBackFunction();
      });
  };

  /**
   * Used to revoke the existing token in the local storage
   * Removes the token from the local storage and makes an API
   * call to revoke the token from the backend server.
   */
  static revokeToken() {
    this._revokeUserAuthorizationFromStore();

    const url = this.authUrlBeginning + "revoke_token/";
    const tokenFromLS = this.getTokenFromLS();

    localStorage.setItem("tokenObject", "");

    const data = { token: tokenFromLS, client_id: process.env.REACT_APP_CLIENT_ID };
    const options = {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: data
    };

    this._fetchFromAPI(url, options);
  }

  // HELPER METHODS DEALING WITH API CALLS-----------------------------------------------
  //-------------------------------------------------------------------------------------
  /**
   * Method used to add the authorization token from the local storage before making
   * the API call.
   */
  static _addAuthorization(url, options = {}) {
    const oAuthToken = this.getTokenFromLS();

    let bearer = "Bearer " + oAuthToken;

    // Append token to header. Create header if it does not exist
    if (options.headers === undefined) {
      options.headers = {};
    }
    options.headers["Authorization"] = bearer;

    return this._fetchFromAPI(url, options);
  }

  /**
   * This method makes the API call and returns the API response as promise
   * If the token is expired, updates the corresponding flag in the store
   * If the server is not responding, updates the corresponding flag in the store
   */
  static _fetchFromAPI(url, options = {}) {
    if (options.headers === undefined) {
      options.headers = {};
    }
    options.headers["Content-Type"] = "application/json";
    if (options.body !== undefined) {
      options.body = JSON.stringify(options.body);
    }
    return fetch(url, options)
      .then(response => {
        if (response.status === 401) {
          this._revokeUserAuthorizationFromStore();

          // TODO: log the response error.
          // Two functions can't call response.json() at the same time.
          response.json().then(response => {
            console.log("RESPONSE", response);
          });
        }
        if (response.status !== 200 && response.status !== 201) {
          console.log("RESPONSE ERROR", url, response);
        }

        return response;
      })
      .catch(error => {
        console.log(error);
        store.dispatch(actions.setIsServerDown(true));
      });
  }

  /**
   * This method returns the response from various API calls as a promise
   */
  static makeAPICall(endpoint, input, options = {}) {
    switch (endpoint) {
      case GET_TOKEN:
        if (options.body === undefined) {
          options.body = {};
        }
        options.body.client_id = process.env.REACT_APP_CLIENT_ID;
        return this._fetchFromAPI(this.authUrlBeginning + "token/", options);
      case CREATE_USER:
        return this._fetchFromAPI(this.urlBeginning + "createUser/", options);
      case VALIDATE_TOKEN:
        return this._addAuthorization(this.urlBeginning + "validateToken/");
      case FORGOT_PASSWORD:
        return this._fetchFromAPI(this.urlBeginning + "password_reset/", options);
      case RESET_PASSWORD:
        return this._fetchFromAPI(this.urlBeginning + "password_reset/confirm", options);
      case UPLOAD_DOCUMENT:
        return this._addAuthorization(this.urlBeginning + "uploadDoc/", options);
      case UPLOAD_ANNOTATIONS:
        return this._addAuthorization(this.urlBeginning + "uploadAnnot/", options);
      case GET_ALL_ANNOTE_BY_CURRENT_USER:
        return this._addAuthorization(this.urlBeginning + "getAllMyAnnots/" + (input == null ? "" : input));
      case GET_ALL_ANNOTE:
        return this._addAuthorization(this.urlBeginning + "getAllAnnots/" + (input == null ? "" : input));
      case GET_ANNOTATIONS_FILENAME_USER:
        return this._addAuthorization(this.urlBeginning + "getAnnotationsByFilenameUser/" + input + this.json);
      case EXPORT_CURRENT_ANNOTATIONS:
        return this._addAuthorization(this.urlBeginning + "exportAnnotations/" + input + this.json);
      case DOWNLOAD_ANNOTATIONS_BY_ID:
        return this._addAuthorization(this.urlBeginning + "downloadAnnotations/" + input + this.json);

      // ICD APIs
      case ANCESTORS:
        return this._addAuthorization(this.urlBeginning + "ancestors/" + input + this.json);
      case FAMILY:
        return this._addAuthorization(this.urlBeginning + "family/" + input + this.json);
      case CODE_AUTO_SUGGESTIONS:
        return this._addAuthorization(this.urlBeginning + "codeAutosuggestions/" + input + this.json);
      case CODE_DESCRIPTION:
        return this._addAuthorization(this.urlBeginning + "codeDescription/" + input + this.json);
      default:
        return null;
    }
  }
}
