
import React, { useEffect, useRef } from 'react';

import { Route } from 'react-router-dom';

import { SelectionType as NavBarSelection, getAllSelections, getInfoForSelection } from 'random-components/NavBar/SelectionType';

import Home from 'App/MainSiteInterface/Home/Home';
import AboutUs from 'App/MainSiteInterface/AboutUs/AboutUs';
import Services from 'App/MainSiteInterface/Services/Services';
import Products from 'App/MainSiteInterface/Products/Products';
import ContactUs from 'App/MainSiteInterface/ContactUs/ContactUs'

import HeaderAndFooterContainer from 'random-components/HeaderAndFooterContainer/HeaderAndFooterContainer';


export default function MainSiteInterface() {


    return <HeaderAndFooterContainer>
        {getAllSelections().map((x, i) => {
            const selectionInfo = getInfoForSelection(x);
            const path = selectionInfo.routePath;
            const isExact = path === "/";
            return <Route key={i} exact={isExact} path={path}
                render={() => {
                    return <ComponentForSelection selection={x} />
                }} />
        })}
    </HeaderAndFooterContainer>
}


function ComponentForSelection(props: { selection: NavBarSelection }) {
    const S = NavBarSelection;

    const isInitialSelection = useRef(true);

    useEffect(() => {
        if (isInitialSelection.current === true){
            isInitialSelection.current = false;
        } else {
            window.scroll(0, 0);
        }
    }, [props.selection]);

    const Component = (() => {
        switch (props.selection) {
            case S.Home: return Home;
            case S.AboutUs: return AboutUs;
            case S.Services: return Services;
            case S.Products: return Products;
            case S.ContactUs: return ContactUs;
        }
    })();

    return <Component />
}



