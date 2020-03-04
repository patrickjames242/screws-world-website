

import React from 'react';
import ReactDom from 'react-dom';
import App from 'App/App';
import './index.scss';



ReactDom.render(<App/>, document.getElementById('root'));

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    console.warn("change the dashboard password to be something more complex");
    console.warn("fix products page issue in edge where text stretches parent if too wide");
    console.warn("on the side bar of the products page, letters that have tails like y's and g's, the tails are cut off");
    console.warn("image on about us page is kind of blury");
    console.warn("add meta tags for search engine optimization");
}

