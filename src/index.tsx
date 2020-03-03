

import React from 'react';
import ReactDom from 'react-dom';
import App from 'App/App';
import './index.scss';



ReactDom.render(<App/>, document.getElementById('root'));

if (!process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
    
    console.warn("change the dashboard password to be something more complex");
    console.warn("fix products page issues in edge");
    
}

