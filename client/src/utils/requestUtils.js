import axios from "axios";
import { connect } from "react-redux";
import { myFirebase } from "../firebase/firebase";

export const authenticatedRequest = async (route, postBodyParams) => {
  const loggedInUser = await currentLoggedInUser();
  const idToken = await loggedInUser.getIdToken();
  return axios.post(route, constructPostBodyParams(idToken, postBodyParams));
};

function currentLoggedInUser(){
  return new Promise(resolve => {
    myFirebase.auth().onAuthStateChanged(firebaseUser => resolve(firebaseUser));
  });
}

export const constructPostBodyParams = (idToken, postBodyParams) => {
  const csrfToken = getCookie("csrfToken");
  postBodyParams["idToken"] = idToken;
  postBodyParams["csrfToken"] = csrfToken;
  return postBodyParams;
};

export const unAuthenticatedRequest = (route, postBodyParams) => {
  return axios.post(route, postBodyParams);
};

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2)
    return parts
      .pop()
      .split(";")
      .shift();
}
