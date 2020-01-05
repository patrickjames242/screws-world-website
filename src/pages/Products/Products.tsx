
import React, { useRef, useEffect } from 'react';
import './Products.scss';
import { Optional } from 'jshelpers';
import { ProductDataObject, productsDataTree, ProductCategory, ProductDataType, getDataObjectForID } from './ProductsData';
import * as NavBarSelection from 'random-components/NavBar/SelectionType';
import { NavLink, useRouteMatch, useParams, Switch, Route, Link } from 'react-router-dom';
import NotFoundPage from 'random-components/NotFoundPage/NotFoundPage';




function getToURLForProductsItem(productsItem: ProductDataObject): string {
    const pathName = NavBarSelection.getInfoForSelection(NavBarSelection.SelectionType.Products).routePath;
    return pathName + "/" + productsItem.id;
}


export default function Products() {

    const currentProductsDataTree = productsDataTree;

    const { url: currentURL } = useRouteMatch();


    const selectedItem: Optional<ProductDataObject> = (() => {
        /* eslint-disable react-hooks/rules-of-hooks */
        const idRouteMatch = (useRouteMatch<{ id: string }>(currentURL + "/:id"));
        const idString = idRouteMatch?.params.id;
        if (idString == null) { return null; }
        const selectedItemID = Number(idString);
        return getDataObjectForID(selectedItemID);
        /* eslint-enable react-hooks/rules-of-hooks */
    })();


    return <Switch>
        <Route path={[currentURL, currentURL + "/:id"]} exact render={() => {
            return <div className="Products">
                <div className="content">
                    <SideBar allCategories={currentProductsDataTree} />
                    <MainContent isTopLevelItems={selectedItem === null} currentlySelectedItem={selectedItem} allItems={currentProductsDataTree} />
                </div>
            </div>
        }} />
        <Route path="*" component={NotFoundPage} />
    </Switch>





}


function SideBar(props: { allCategories: ProductDataObject[] }) {

    const contentHolderRef = useRef<HTMLDivElement>(null);

    const faderElements = useSideBarFaderFunctionality(contentHolderRef);

    return <div className="SideBar">
        <div className="content-holder" ref={contentHolderRef}>
            <div className="content">
                {
                    props.allCategories.map(x => {
                        return <SideBarLink category={x} key={x.id} />
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

            const isScrolledToTop = contentHolder.scrollTop === 0;
            const isScrolledToBottom = contentHolder.scrollTop === contentHolder.scrollHeight - contentHolder.clientHeight;

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
    }, []);

    return <>
        <div className="top-fader" ref={topFaderRef}></div>
        <div className="bottom-fader" ref={bottomFaderRef}></div>
    </>
}


function SideBarLink(props: { category: ProductDataObject }) {
    const path = getToURLForProductsItem(props.category)
    return <NavLink exact strict to={path} className="SideBarLink" activeClassName="selected">
        <div className="title">{props.category.name}</div>
        <div className="chevron">›</div>
    </NavLink>
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

    const path = getToURLForProductsItem(props.dataObject);

    return <Link to={path} className="ProductOrCategoryItem">
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
    </Link>
}

