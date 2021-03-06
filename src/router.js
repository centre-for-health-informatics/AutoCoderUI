import { Route, BrowserRouter, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import { Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";
import React from "react";
import store from "./Store/configureStore";
import Sandbox from "./Pages/Sandbox/Sandbox";
import Tags from "./Pages/Tags/Tags";
import Annotate from "./Pages/Annotate/Annotate";
import SignIn from "./Pages/SignIn/SignIn";
import SignUp from "./Pages/SignUp/SignUp";
import SignUpSuccess from "./Pages/SignUpSuccess/SignUpSuccess";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import SignedOut from "./Pages/SignedOut/SignedOut";
import ProjectOverview from "./Pages/Project/ProjectOverview";
import Admin from "./Pages/Admin/Admin";

const router = (
  <Provider store={store}>
    <AlertProvider template={AlertTemplate}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Annotate} />
          <Route exact path="/annotate" component={Annotate} />
          <Route exact path="/sandbox" component={Sandbox} />
          <Route exact path="/tags" component={Tags} />
          <Route exact path="/sign-in" component={SignIn} />
          <Route exact path="/sign-up" component={SignUp} />
          <Route exact path="/sign-up-success" component={SignUpSuccess} />
          <Route exact path="/forgot-password" component={ForgotPassword} />
          <Route exact path="/signed-out" component={SignedOut} />
          <Route exact path="/project" component={ProjectOverview} />
          <Route exact path="/admin" component={Admin} />
        </Switch>
      </BrowserRouter>
    </AlertProvider>
  </Provider>
);

export default router;
