

import React from 'react';
import ReactDom from 'react-dom';
import App from 'App/App';
import './index.scss';



ReactDom.render(<App/>, document.getElementById('root'));


console.warn("when selecting an image on ios, sometimes only half of the image shows up in the actual space for the image on the website.");
console.warn("change the dashboard password to be something more complex");
console.warn("png file isn't compressed properly on ios, file becomes larger instead of smaller");

console.warn("compress asset images");