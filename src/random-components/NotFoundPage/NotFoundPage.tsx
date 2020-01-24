

import React from 'react';
import './NotFoundPage.scss';
import { useSetTitleFunctionality } from 'jshelpers';

export default function NotFoundPage() {
    useSetTitleFunctionality("Page Not Found");
    return <div className="NotFoundPage">
        <div className="text-box">
            <div className="title">Page Not Found</div>
            <div className="description">Sorry, but we couldn't find what you were looking for.</div>
        </div>
    </div>
}


