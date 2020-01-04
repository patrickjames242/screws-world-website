
import React, { useRef, useEffect, useState } from 'react';
import './Products.scss';
import { getIntegerArray } from 'jshelpers';


type Optional<Wrapped> = Wrapped | null;



enum ProductDataType {
    Product,
    ProductCategory,
}

interface ProductDataObject {
    readonly id: number,
    readonly name: string,
    readonly description: string,
    readonly dataType: ProductDataType,
}

class Product implements ProductDataObject {

    readonly dataType: ProductDataType.Product = ProductDataType.Product;

    constructor(
        readonly id: number,
        readonly name: string,
        readonly description: string,

    ) { }
}

class ProductCategory implements ProductDataObject {

    readonly dataType: ProductDataType.ProductCategory = ProductDataType.ProductCategory;

    constructor(
        readonly id: number,
        readonly name: string,
        readonly description: string,
        readonly children: ProductDataObject[] = [],
    ) { }
}

function getProductsDataTree(): ProductDataObject[] {

    const names = [
        "Hex bolts", "Flange bolts", "Roofing screws", "Socket screws", "Set screws", "Nuts", "Washers", "Threaded inserts", "Elevator bolts", "Thumb screws"
    ];

    const descriptions = [
        "The most common type of bolt used in structural connections offering a larger diameter hex head."
    ]

    const getRandomDecimal = (() => {
        
        let currentRandomDecimalIndex = -1;
        const randomDecimals = getIntegerArray(0, 20).map(x => x / 20);

        return () => {
            currentRandomDecimalIndex = (currentRandomDecimalIndex + 1) % randomDecimals.length
            const selectedDecimal = randomDecimals[currentRandomDecimalIndex];
            return selectedDecimal;
        }
    })();

    function getRandomElementFrom<Element>(array: Element[]): Optional<Element>{
        if (array.length <= 0) { return null; }
        const randomIndex = Math.round((array.length - 1) * getRandomDecimal());
        return array[randomIndex];
    }

    const getRandomName = () => getRandomElementFrom(names)!;
    const getRandomDescription = () => getRandomElementFrom(descriptions)!;

    let nextAvailableID = 0;

    const categories = getIntegerArray(1, 20).map(() => {
        const upper = Math.round(getRandomDecimal() * 15) + 3;
        const products = getIntegerArray(1, upper).map(() => {
            return new Product(nextAvailableID++, getRandomName(), getRandomDescription());
        })

        return new ProductCategory(nextAvailableID++, getRandomName(), getRandomDescription(), products);
    });

    return categories;
}



export default function Products() {

    const currentProductsDataTree =
        (Products as any).currentProductsDataTree ??
        ((Products as any).currentProductsDataTree = getProductsDataTree());

    const [selectedItem, setSelectedItem] = useState<Optional<ProductDataObject>>(null);

    function respondToItemClick(item: ProductDataObject){
        setSelectedItem(item);
    }
    
    return <div className="Products">
        <SideBar allCategories={currentProductsDataTree} onItemClick={respondToItemClick} selectedItem={selectedItem}/>
        <MainContent isTopLevelItems={selectedItem === null} currentlySelectedItem={selectedItem} allItems={currentProductsDataTree}/>
    </div>
}


function SideBar(props: { allCategories: ProductDataObject[], onItemClick: (object: ProductDataObject) => void, selectedItem: Optional<ProductDataObject>}) {
    
    const contentHolderRef = useRef<HTMLDivElement>(null);

    const faderElements = useSideBarFaderFunctionality(contentHolderRef.current);

    return <div className="SideBar">
        <div className="content-holder" ref={contentHolderRef}>
            <div className="content">
                {
                    props.allCategories.map(x => {
                        const isSelected = x.id === props.selectedItem?.id;
                        return <SideBarLink category={x} onClick={props.onItemClick} isSelected={isSelected} key={x.id} />
                    })
                }
            </div>
        </div>
        {faderElements}
    </div>
}

function useSideBarFaderFunctionality(contentHolder: Optional<HTMLElement>): React.ReactElement {
    
    const topFaderRef = useRef<HTMLDivElement>(null);
    const bottomFaderRef = useRef<HTMLDivElement>(null);

    

    useEffect(() => {
    
        function respondToOnScroll() {
            if (contentHolder === null){return;}
            
            const isScrolledToTop = contentHolder.scrollTop === 0;
            const isScrolledToBottom = contentHolder.scrollTop === contentHolder?.scrollHeight - contentHolder?.clientHeight;

            const newTopFaderOpacity = isScrolledToTop ? "0" : "1";
            const newBottomFaderOpacity = isScrolledToBottom ? "0" : "1";
            
            if (topFaderRef.current!.style.opacity !== newTopFaderOpacity){
                topFaderRef.current!.style.opacity = newTopFaderOpacity;
            }

            if (bottomFaderRef.current!.style.opacity !== newBottomFaderOpacity){
                bottomFaderRef.current!.style.opacity = newBottomFaderOpacity
            }
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
    }, []);

    return <>
        <div className="top-fader" ref={topFaderRef}></div>
        <div className="bottom-fader" ref={bottomFaderRef}></div>
    </>
}



function SideBarLink(props: { category: ProductDataObject, isSelected: boolean, onClick: (category: ProductDataObject) => void }) {

    function respondToOnClick() {
        props.onClick(props.category);
    }

    return <div className={"SideBarLink" + (props.isSelected ? " selected" : "")} onClick={respondToOnClick}>
        <div className="title">{props.category.name}</div>
        <div className="chevron">›</div>
    </div>
}


function MainContent(props: { isTopLevelItems: boolean, currentlySelectedItem: Optional<ProductDataObject>, allItems: Optional<ProductDataObject[]> }) {

    const [title, description] = (() => {
        const title = props.isTopLevelItems ? "Browse Our Products" : (props.currentlySelectedItem?.name ?? "NO TITLE PROVIDED");

        const description = props.isTopLevelItems ? "Here you can browse a catalogue of our top selling products to see exactly what we have to offer." : (props.currentlySelectedItem?.description ?? "NO DESCRIPTION PROVIDED");

        return [title, description];
    })();

    const products = (props.isTopLevelItems ? props.allItems : (props.currentlySelectedItem as ProductCategory)?.children) ?? []

    return <div className="MainContent">

        <div className="title-box">
            <div className="text-box">
                <div className="title">{title}</div>
                <div className="description">{description}</div>
            </div>
            <div className="bottom-line" />
        </div>

        <div className="product-grid">
            {products.map(x => {
                return <ProductOrCategoryItem dataObject={x} key={x.id} />
            })}
        </div>

    </div>
}


function ProductOrCategoryItem(props: { dataObject: ProductDataObject }) {

    const productOrCategoryText = (() => {
        switch (props.dataObject.dataType) {
            case ProductDataType.Product: return "product";
            case ProductDataType.ProductCategory: return "category";
        }
    })();

    return <a href="" className="ProductOrCategoryItem">
        <div className="background-view" />
        <div className="content-box">
            <div className="image-box">
                <div className="content">
                    <div className="product-or-category">{productOrCategoryText}</div>
                </div>
            </div>
            <div className="under-image-content">
                <div className="text-box">
                    <div className="title">{props.dataObject.name}</div>
                    <div className="description">{props.dataObject.description}</div>
                </div>
            </div>

        </div>
    </a>
}




