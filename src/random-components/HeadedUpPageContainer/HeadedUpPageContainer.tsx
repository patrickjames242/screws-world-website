import React from 'react';
import './HeadedUpPageContainer.scss';
import PageHeader, { PageHeaderProps } from 'random-components/PageHeader/PageHeader';

export interface HeadedUpPageContainer_StylingProps{
    maxContentWidth?: string,
    sideContainerPadding?: string,
}

export interface HeadedUpPageContainerProps{
    pageHeaderProps: PageHeaderProps,
    className?: string,
    stylingProps?: HeadedUpPageContainer_StylingProps,
    children: React.ReactNode,
}

export default function HeadedUpPageContainer(props: HeadedUpPageContainerProps){
    const className = ["HeadedUpPageContainer", props.className ?? ""].join(" ");
    return <div className={className}>
        <div className="content" style={{
            maxWidth: props.stylingProps?.maxContentWidth ?? "60rem",
        }}>
            <PageHeader {...props.pageHeaderProps}/>
            {props.children}
        </div>
    </div>
}
