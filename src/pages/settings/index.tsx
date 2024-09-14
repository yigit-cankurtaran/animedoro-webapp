import React from "react";
import { errorToast, successToast } from "@/things/Toast";

function settings() {
  return (
    <div>
      <h1>Settings</h1>
      <button onClick={() => successToast("success toast")}>
        success toast
      </button>
      <br />
      <button onClick={() => errorToast("error toast")}>error toast</button>
    </div>
  );
  // TODO: make a proper settings page
}

export default settings;
