
import React from 'react';
import ReactDom from 'react-dom';
import {Router, Route} from 'react-router-dom';
import NavBar, {SelectionType as NavBarSelection} from './random-components/NavBar/NavBar';
import {createBrowserHistory} from 'history';
import './index.scss';

import Home from './pages/Home/Home';
import AboutUs from './pages/AboutUs/AboutUs';
import Services from './pages/Services/Services';
import Products from './pages/Products/Products';
import ContactUs from './pages/ContactUs/ContactUs'


class App extends React.Component {

    history = createBrowserHistory();

    render() {

        const currentItem = NavBarSelection.getItemForRoutePath(this.history.location.pathname);
        
        return <div className="App">
            <Router history={this.history}>
                <NavBar selectedItem={currentItem}/>
                <PageComponentForCurrentRoute/>
            </Router>
        </div>
    }
}

function PageComponentForCurrentRoute() {
    const S = NavBarSelection;

    function getComponentForSelection(selection){
        switch(selection){
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
                    <Component/>
                </Route>
            })
        }
    </React.Fragment>
}







ReactDom.render(<App />, document.getElementById('root'));
