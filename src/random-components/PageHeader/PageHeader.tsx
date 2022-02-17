import React from "react";
import "./PageHeader.scss";

export interface PageHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

export default function PageHeader(props: PageHeaderProps) {
  const className = ["PageHeader", props.className ?? ""].join(" ");
  return (
    <div className={className}>
      <div className="text-content">
        <h1 className="title">{props.title}</h1>
        <h2 className="subtitle">{props.subtitle}</h2>
      </div>
    </div>
  );
}
