import React from "react";
import "./NotFoundPage.scss";
import { useSetTitleFunctionality } from "jshelpers";

export default function NotFoundPage() {
  useSetTitleFunctionality("Page Not Found");
  return (
    <div className="NotFoundPage">
      <div className="text-box">
        <h1 className="title">Page Not Found</h1>
        <p className="description">
          Sorry, but we couldn't find what you were looking for.
        </p>
      </div>
    </div>
  );
}
