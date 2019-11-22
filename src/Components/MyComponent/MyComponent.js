import React, { useState } from "react";

function MyComponent(props) {
  return props.data.map(item => <h1>{item.name}</h1>);
}

export default MyComponent;
