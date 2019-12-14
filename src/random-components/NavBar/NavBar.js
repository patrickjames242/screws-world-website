
import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import './NavBar.scss';

import screwLogo from 'assets/nav-bar-icons/screws-logo.js';
import servicesIcon from 'assets/nav-bar-icons/services.js';
import productsIcon from 'assets/nav-bar-icons/products.js';
import contactIcon from 'assets/nav-bar-icons/contact.js';
import aboutUsIcon from 'assets/nav-bar-icons/about-us.js';


export const SelectionType = {

    home: Symbol('home'),
    aboutUs: Symbol('aboutUs'),
    services: Symbol('services'),
    products: Symbol('products'),
    contactUs: Symbol('contactUs'),

    getAll() {
        return [this.home, this.aboutUs, this.services, this.products, this.contactUs];
    },

    getTextValueFor(item) {
        switch (item) {
            case this.home: return 'home';
            case this.aboutUs: return 'about us';
            case this.services: return 'services';
            case this.products: return 'products';
            case this.contactUs: return 'contact us';
            default: throw new Error("invalid item sent to 'getTextValueFor'");
        }
    },

    getRoutePathFor(item) {
        return this.routePaths[item];
    },

    getItemForRoutePath(routePath) {
        const result = Object
            .getOwnPropertySymbols(this.routePaths)
            .find(x => this.routePaths[x] === routePath);
        return result;
    }
}

SelectionType.routePaths = (() => {
    const s = SelectionType;
    return {
        [s.home]: '/',
        [s.aboutUs]: '/about-us',
        [s.services]: '/services',
        [s.products]: '/products',
        [s.contactUs]: '/contact-us'
    }
})();


export default class NavBar extends React.Component {

    static propTypes = {
        selectedItem: PropTypes.oneOf(SelectionType.getAll()).isRequired
    }

    render() {
        const S = SelectionType;
        return <div className="NavBar">
            <div className="content">
                <Link to="/" className="title-box">
                    <div className="screw-logo-holder">{screwLogo}</div>
                    <div className="text">
                        <span>Screws</span>
                        <span>World</span>
                    </div>
                </Link>
                <div className="links-box">
                    {
                        [{ name: "About Us", image: aboutUsIcon, item: S.aboutUs},
                        { name: "Services", image: servicesIcon, item: S.services},
                        { name: "Products", image: productsIcon, item: S.products},
                        { name: "Contact Us", image: contactIcon, item: S.contactUs }]
                            .map((x, i) => {
                                const isSelected = this.props.selectedItem === x.item;
                                return <NavBarLink text={x.name} image={x.image} item={x.item} isSelected={isSelected} key={i} />
                            })
                    }
                </div>
            </div>
        </div>
    }
}

function NavBarLink(props) {
    const path = SelectionType.getRoutePathFor(props.item);
    return <NavLink exact to={path} activeClassName="selected">
        <div className="icon-container">{props.image}</div>
        <div className="text-box">{props.text}</div>
    </NavLink>
}

NavBarLink.propTypes = {
    text: PropTypes.string.isRequired,
    image: PropTypes.element.isRequired,
    isSelected: PropTypes.bool.isRequired,
    item: PropTypes.oneOf(SelectionType.getAll()).isRequired
}