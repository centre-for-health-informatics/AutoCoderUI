import { Route, BrowserRouter, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import React from "react";
import store from "./Store/configureStore";
import Sandbox from "./Pages/Sandbox/Sandbox";
import Tags from "./Pages/Tags/Tags";
import Annotate from "./Pages/Annotate/Annotate";

const router = (
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route path="/sandbox" component={Sandbox} />
        <Route path="/tags" component={Tags} />
        <Route path="/annotate" component={Annotate} />
      </Switch>
    </BrowserRouter>
  </Provider>
);

export default router;
