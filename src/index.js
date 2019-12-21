

import React, { useRef, useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import { Router, Route } from 'react-router-dom';
import NavBar, { SelectionType as NavBarSelection } from './random-components/NavBar/NavBar';
import { createBrowserHistory } from 'history';
import './index.scss';
import scssVariables from './_helpers.scss';

import Home from './pages/Home/Home';
import AboutUs from './pages/AboutUs/AboutUs';
import Services from './pages/Services/Services';
import Products from './pages/Products/Products';
import ContactUs from './pages/ContactUs/ContactUs'

import {animated, useTransition} from 'react-spring';

const wideNavBarLinksCutOffPoint = window.matchMedia(`(max-width: ${scssVariables.wideNavBarLinksCutOffPoint})`);

function App() {

    const history = useRef(createBrowserHistory()).current;

    const currentItem = NavBarSelection.getItemForRoutePath(history.location.pathname);

    const [shouldDisplayDimmer, setShouldDisplayDimmer] = useState(false);

    function respondToNavBarExpansionStateChange(isExpanded){
        document.body.style.overflow = isExpanded ? "hidden" : "initial";
        setShouldDisplayDimmer(isExpanded);
    }

    function respondToScreenDimmerClick(){
        navBarDelegateRef.setNavBarExpanded({isExpanded: false});
    }

    const navBarDelegateRef = {};

    useEffect(() => {
        history.listen(() => {
            navBarDelegateRef.setNavBarExpanded({isExpanded: false});
        });
    }, []);

    const backgroundDimmerTransition = useTransition(shouldDisplayDimmer, null, {
        from: {opacity: 0},
        enter: {opacity: 1},
        leave: {opacity: 0}
    });

    useEffect(() => {
        wideNavBarLinksCutOffPoint.addListener((media) => {
            if (media.matches === false){
                navBarDelegateRef.setNavBarExpanded({isExpanded: false, isAnimated: false});
            }
        })
    }, [])

    

    return <div className="App" style={{position: "relative"}}>
        <Router history={history}>
            <NavBar selectedItem={currentItem} onExpansionStateChange={respondToNavBarExpansionStateChange} delegateRef={navBarDelegateRef}/>
            <PageComponentForCurrentRoute />

            {backgroundDimmerTransition.map(({item, key, props}) => {
                return item ? <ScreenDimmer key={key} style={props} onClick={respondToScreenDimmerClick}/> : null;
            })}
        </Router>
    </div>
}

function PageComponentForCurrentRoute() {
    const S = NavBarSelection;

    function getComponentForSelection(selection) {
        switch (selection) {
            case S.home: return Home;
            case S.aboutUs: return AboutUs;
            case S.services: return Services;
            case S.products: return Products;
            case S.contactUs: return ContactUs;
            default: break;
        }
    }

    return <React.Fragment>
        {
            S.getAll().map((x, i) => {
                const Component = getComponentForSelection(x);
                return <Route key={i} exact path={S.getRoutePathFor(x)}>
                    <Component />
                </Route>
            })
        }
    </React.Fragment>
}

function ScreenDimmer(props){
    return <animated.div onClick={props.onClick} style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        position: "absolute",
        top: "0", left: "0", width: "100%", height: "100%",
        zIndex: "5",
        ...props.style,
    }}/>
}


ReactDom.render(<App />, document.getElementById('root'));






// function TestApp(){
//     const [isPresented, setIsPresented] = useState(false);

//     const transitions = useTransition(isPresented, null, {
//         from: {opacity: 0},
//         enter: {opacity: 1},
//         leave: {opacity: 0},
        
//     });
//     const customStyles = {        
//         backgroundColor: "red",
//         height: "500px",
//     }

//     function respondToButtonClicked(){
//         setIsPresented(isPresented => !isPresented);
//     }

//     const buttonStyle = {
//         padding: "10px", 
//         backgroundColor: "red", 
//         color: "white", 
//         fontSize: "20px", 
//         margin: "20px",
//         cursor: "pointer"
//     }


//     return <>
//         {transitions.map(({item, key, props}) => {
//             console.log(props);
//             return item ? <animated.div key={key} style={{...props, ...customStyles}}></animated.div> : null
//         })} 
//         <button onClick={respondToButtonClicked} style={buttonStyle}>
//             {isPresented ? "Hide" : "Show"}
//         </button>
//     </>
    
    
// }

// ReactDom.render(<TestApp/>, document.getElementById('root'));
