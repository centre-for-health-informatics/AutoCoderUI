// Endpoints
export const GET_TOKEN = "GET_TOKEN";
export const VALIDATE_TOKEN = "VALIDATE_TOKEN";

export class API {
  static serverAddress = process.env.REACT_APP_SERVER_ADDRESS;
  static urlBeginning = this.serverAddress + "/api/";
  static authUrlBeginning = this.serverAddress + "/o/";
  static json = "/?format=json";

  /**
   * Get token from browser local storage
   */
  static getTokenFromStorage() {
    const token = localStorage.getItem("tokenObject");
    if (token !== "" && token !== null) {
      return JSON.parse(token).access_token;
    } else {
      return -1;
    }
  }

  static getTokenFromAPI(username, password) {
    const body = {
      username: username,
      password: password,
      grant_type: "password"
    };
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const options = {
      method: "post",
      headers: headers,
      body: body
    };

    return this.makeAPICall(GET_TOKEN, null, options);
  }

  /**
   * Add token bearer to the header of API call
   */
  static _addAuthorization(url, options = {}) {
    const token = this.getTokenFromStorage;
    let bearer = "Bearer " + token;

    options.headers["Authrorization"] = bearer;

    return this._fetchFromAPI(url, options);
  }

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
          //revoke token
        }
        if (response.status !== 200) {
          console.log("RESPONSE ERROR", url, response);
        }
        return response.json();
      })
      .catch(error => {
        console.log(error);
      });
  }

  static makeAPICall(endpoint, input, options = {}) {
    switch (endpoint) {
      case VALIDATE_TOKEN:
        return this._addAuthorization(this.urlBeginning + "validateToken/");
      case GET_TOKEN:
        options.body.client_id = process.env.REACT_APP_CLIENT_ID;
        return this._fetchFromAPI(this.authUrlBeginning + "token/", options);
    }
  }
}
