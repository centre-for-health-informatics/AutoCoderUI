import { Route, BrowserRouter, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import React from "react";
import store from "./Store/configureStore";

import ExamplePage from "./Pages/Example/ExamplePage.js";

const router = (
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={ExamplePage} />
      </Switch>
    </BrowserRouter>
  </Provider>
);

export default router;
