

import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import './index.scss';
import App from 'App/App';


ReactDom.render(<Router><App/></Router>, document.getElementById('root'));


