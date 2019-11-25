import { Route, BrowserRouter, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import { Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";
import React from "react";
import store from "./Store/configureStore";
import Sandbox from "./Pages/Sandbox/Sandbox";
import Tags from "./Pages/Tags/Tags";
import Annotate from "./Pages/Annotate/Annotate";

const router = (
  <Provider store={store}>
    <AlertProvider template={AlertTemplate}>
      <BrowserRouter>
        <Switch>
          <Route path="/sandbox" component={Sandbox} />
          <Route path="/tags" component={Tags} />
          <Route path="/annotate" component={Annotate} />
        </Switch>
      </BrowserRouter>
    </AlertProvider>
  </Provider>
);

export default router;
