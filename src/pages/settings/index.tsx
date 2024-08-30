import React from "react";
import { useContext, createContext, useEffect, useRef } from "react";

const MessageContext = createContext("hello world");

function settings() {
  const message = useContext(MessageContext);
  const hasLogged = useRef(false);

  useEffect(() => {
    if (!hasLogged.current) {
      alert("the message is " + message);
      hasLogged.current = true;
      // if we don't want double logging or calling to happen in dev
      // we use Ref
      // else we use state
    }
  }, [hasLogged]);

  return <div>settings</div>;
}

export default settings;
