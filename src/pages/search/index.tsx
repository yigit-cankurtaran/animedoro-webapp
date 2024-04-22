"use client";
import { useState } from "react";

export default function Search() {
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // prevents the page from reloading
    const formData = new FormData(event.target as HTMLFormElement);
    // we need this for the type to be correct
    const animeName = formData.get("animeName");
    // alert(animeName);
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <label htmlFor="searchInput">
          Search anime:
          <input type="text" name="animeName" />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </>
  );
  //   this will search for anime and display them
  //  we will use the Jikan API
  //   display a list of them
}
