import React from "react";
import scssVariables from "_helpers.module.scss";
import NavBar from "random-components/NavBar/NavBar";
import Footer from "random-components/Footer/Footer";

export default function HeaderAndFooterContainer(props: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="HeaderAndFooterContainer"
      style={{ marginTop: scssVariables.navBarHeightFromScreenTop }}
    >
      <NavBar />
      {props.children}
      <Footer />
    </div>
  );
}
