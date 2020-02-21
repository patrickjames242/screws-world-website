
import React from 'react';
import './PageHeader.scss';

export interface PageHeaderProps{
    title: string,
    subtitle: string,
    className?: string,
}

export default function PageHeader(props: PageHeaderProps) {
    const className = ["PageHeader", props.className ?? ""].join(" ");
    return <div className={className}>
        <div className="text-content">
            <div className="title">{props.title}</div>
            <div className="subtitle">{props.subtitle}</div>
        </div>
    </div>
}