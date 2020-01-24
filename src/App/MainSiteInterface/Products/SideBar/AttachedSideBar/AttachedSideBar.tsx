
import React, { useRef, useEffect } from 'react';

import SideBarLinksNode from '../SideBarLinksNode/SideBarLinksNode';

import './AttachedSideBar.scss';
import { useAllTopLevelProductItems } from '../../ProductsUIHelpers';



export default function AttachedSideBar() {
    const allTopLevelProductItems = useAllTopLevelProductItems();
    
    const contentHolderRef = useRef<HTMLDivElement>(null);

    const faderElements = useSideBarFaderFunctionality(contentHolderRef);

    return <div className="AttachedSideBar SideBar">
        <div className="content-holder" ref={contentHolderRef}>
            <div className="content">
                {
                    allTopLevelProductItems.map(x => {
                        return <SideBarLinksNode item={x} key={x.id} />
                    })
                }
            </div>
        </div>
        {faderElements}
    </div>
}



function useSideBarFaderFunctionality(contentHolderRef: React.RefObject<HTMLElement>): React.ReactElement {

    const topFaderRef = useRef<HTMLDivElement>(null);
    const bottomFaderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const contentHolder = contentHolderRef.current;

        function respondToOnScroll() {
            if (contentHolder === null) { return; }

            const isScrolledToTop = contentHolder.scrollTop <= 0;
            const isScrolledToBottom = contentHolder.scrollTop >= contentHolder.scrollHeight - contentHolder.clientHeight;

            const newTopFaderOpacity = isScrolledToTop ? "0" : "1";
            const newBottomFaderOpacity = isScrolledToBottom ? "0" : "1";

            topFaderRef.current!.style.opacity = newTopFaderOpacity;
            bottomFaderRef.current!.style.opacity = newBottomFaderOpacity
        }

        respondToOnScroll();

        const resizeEvent = 'resize';
        const scrollEvent = 'scroll';
        contentHolder?.addEventListener(scrollEvent, respondToOnScroll);
        window.addEventListener(resizeEvent, respondToOnScroll);

        return () => {
            contentHolder?.removeEventListener(scrollEvent, respondToOnScroll);
            window.removeEventListener(resizeEvent, respondToOnScroll);
        }
        // eslint-disable-next-line
    }, []);

    return <>
        <div className="top-fader" ref={topFaderRef}></div>
        <div className="bottom-fader" ref={bottomFaderRef}></div>
    </>
}




