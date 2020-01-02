import React, { useRef, useEffect, useState } from 'react';
import './Products.scss';

export default function Products() {
    return <div className="Products">
        <SideBar />
        <MainContent />
    </div>
}

class ProductCategory {

    constructor(
        public id: number,
        public name: string
    ) { }

    static getAll(): ProductCategory[] {
        const arrayToReturn: ProductCategory[] = [];
        for (let i = 0; i < 50; i++) {
            arrayToReturn.push(new ProductCategory(i, "Test Category " + i));
        }
        return arrayToReturn;
    }
}


function SideBar() {
    const [selectedCategoryID, setSelectedCategoryID] = useState(0);
    const contentHolderRef = useRef<HTMLDivElement>(null);

    const faderElements = useSideBarFaderFunctionality(contentHolderRef);

    function respondToLinkClicked(category: ProductCategory){
        setSelectedCategoryID(category.id);
    }

    return <div className="SideBar">
        <div className="content-holder" ref={contentHolderRef}>
            <div className="content">
                {
                    ProductCategory.getAll().map((x, i) => {
                        const isSelected = x.id === selectedCategoryID;
                        return <SideBarLink category={x} onClick={respondToLinkClicked} isSelected={isSelected} key={i} />
                    })
                }
            </div>
        </div>
        {faderElements}
    </div>
}

function useSideBarFaderFunctionality(contentHolderRef: React.RefObject<HTMLElement>): React.ReactElement{

    const topFaderRef = useRef<HTMLDivElement>(null);
    const bottomFaderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        function respondToOnScroll(){
            const contentHolder = contentHolderRef.current!;
            const isScrolledToTop = contentHolder.scrollTop === 0;
            const isScrolledToBottom = contentHolder.scrollTop === contentHolder.scrollHeight - contentHolder.clientHeight;
            
            topFaderRef.current!.style.opacity = isScrolledToTop ? "0" : "1";
            bottomFaderRef.current!.style.opacity = isScrolledToBottom ? "0" : "1";
        }
        respondToOnScroll();
        contentHolderRef.current?.addEventListener('scroll', respondToOnScroll);
    }, []);

    return <>
        <div className="top-fader" ref={topFaderRef}></div>
        <div className="bottom-fader" ref={bottomFaderRef}></div>
    </>
}



function SideBarLink(props: { category: ProductCategory, isSelected: boolean, onClick: (category: ProductCategory) => void}) {

    function respondToOnClick(){
        props.onClick(props.category);
    }

    return <div className={"SideBarLink" + (props.isSelected ? " selected" : "")} onClick={respondToOnClick}>
        <div className="title">{props.category.name}</div>
        <div className="chevron">›</div>
    </div>
}

function MainContent() {
    return <div className="MainContent">

    </div>
}




