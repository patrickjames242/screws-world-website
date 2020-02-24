import React, { useEffect, useRef, useState } from 'react';
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
    

    const contentRef = useRef<HTMLDivElement>(null);

    const maxContentWidth = props.stylingProps?.maxContentWidth ?? '60rem';

    const [maxContentWidthHasBeenSet, setMaxContentWidthHasBeenSet] = useState(false);
   
    useEffect(() => {
        if (contentRef.current == null){return;}
        contentRef.current.style.setProperty('--HeadedUpPageContainer-max-content-width', maxContentWidth);
        setMaxContentWidthHasBeenSet(true);
    }, [maxContentWidth])

    const className = ["HeadedUpPageContainer", props.className ?? ""].join(" ");

    return <div className={className}>
        <div className="content" ref={contentRef} style={{
            // we add the maxWidth to the style for the element to avoid flickering and remove it when the appropriate property is set after the component is mounted
            maxWidth: maxContentWidthHasBeenSet ? undefined : maxContentWidth,
        }}>
            <PageHeader {...props.pageHeaderProps}/>
            {props.children}
        </div>
    </div>
}
