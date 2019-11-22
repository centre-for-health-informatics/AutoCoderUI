import React from "react";
import ReactDOM from "react-dom";
import ExamplePage from "./ExamplePage";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<Example />, div);
  ReactDOM.unmountComponentAtNode(div);
});
