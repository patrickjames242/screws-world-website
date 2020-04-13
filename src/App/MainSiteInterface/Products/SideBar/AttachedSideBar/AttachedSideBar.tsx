
import React, { useRef, useEffect } from 'react';

import SideBarLinksNode from '../SideBarLinksNode/SideBarLinksNode';

import './AttachedSideBar.scss';
import { useAllTopLevelProductItems, useProductsInfoContextValue } from '../../ProductsUIHelpers';
import SideBarLoadingIndicator from '../SideBarLoadingIndicator/SideBarLoadingIndicator';



export default function AttachedSideBar() {
    const allTopLevelProductItems = useAllTopLevelProductItems();

    const productInfo = useProductsInfoContextValue();

    const contentHolderRef = useRef<HTMLDivElement>(null);

    const faderElements = useSideBarFaderFunctionality(contentHolderRef);

    return <div className="AttachedSideBar SideBar">
        <div className="content-holder" ref={contentHolderRef}>
            {(() => {
                if (productInfo.loadingIsFinished === false) {
                    return <SideBarLoadingIndicator />
                }
            })()}
            <div className="content">
                {allTopLevelProductItems.map(x => {
                    return <SideBarLinksNode item={x} key={x.id.stringVersion} />
                })}
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
            // if (isScrolledToBottom){
            //     console.log("is scrolled to bottom!!");
            // }

            // if (isScrolledToTop){
            //     console.log("is scrolled to top");
            // }

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




