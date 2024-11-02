import React from "react";
// import { errorToast, successToast } from "@/things/Toast";

function settings() {
  return (
    <div>
      <h1>Settings</h1>
      {/* <button onClick={() => successToast("success toast")}> */}
      {/*   success toast */}
      {/* </button> */}
      {/* <br /> */}
      {/* <button onClick={() => errorToast("error toast")}>error toast</button> */}
    </div>
  );
  // TODO: make a proper settings page
  // we can use jotai to store the settings globally
  // release after settings is done
  // or just skip this for now maybe?
  // later on we can add a light-dark mode switch or something
  //
  // idk if i even need this
}

export default settings;
