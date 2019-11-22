import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import "./ExamplePage.css";
import * as APIUtility from "../../Util/api";
import * as actions from "../../Store/Actions/index.js";
import MyComponent from "../../Components/MyComponent/MyComponent";

const data = [
  {
    id: 1,
    name: "Jing",
    score: 2000
  },
  {
    id: 2,
    name: "Oscar",
    score: 3000
  }
];

const ExamplePage = props => {
  const [welcomeText, setWelcomeText] = useState("API TEST");

  const getToken = () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    APIUtility.API.getTokenFromAPI(username, password)
      .then(response => {
        if (response.access_token !== undefined) {
          // setToken(response.access_token);
          props.setTextDisplayed(response.access_token);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  console.log("TEXT DISPLAYED: " + props.textDisplayed);
  return (
    <React.Fragment>
      <div>
        <p>{welcomeText}</p>
        <p> Token: {props.textDisplayed} </p>
        <input type="text" id="username" defaultValue="admin"></input>
        <input type="password" id="password" defaultValue="admin"></input>
        <br />
        <input type="submit" value="Get Token" onClick={getToken}></input>
      </div>
      <div>
        <MyComponent data={data} />
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = store => {
  return {
    textDisplayed: store.example.exampleText
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setTextDisplayed: value => dispatch(actions.setExampleText(value))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExamplePage);
