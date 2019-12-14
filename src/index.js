
import React from 'react';
import ReactDom from 'react-dom';
import NavBar from './random-components/NavBar/NavBar';
import './index.scss';


class App extends React.Component {
    render() {
        return <div className="App">
            <NavBar/>
            <div style={{height: "5000px", backgroundColor: "transparent"}}></div>
        </div>
    }
}




ReactDom.render(<App />, document.getElementById('root'));
