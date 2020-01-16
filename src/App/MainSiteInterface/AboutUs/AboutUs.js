import React from 'react';
import './AboutUs.scss';
import { useSetTitleFunctionality } from 'jshelpers';

export default function AboutUs() {

    useSetTitleFunctionality("About Us");
    
    return <div className="page-comming-soon">About Us Page Coming Soon</div>
    
}