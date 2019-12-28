import React from 'react';
import PropTypes from 'prop-types';

import './PageHeader.scss';

export default function PageHeader({ title, subtitle, className = "" }) {
    return <div className={"PageHeader " + className}>
        <div className="text-content">
            <div className="title">{title}</div>
            <div className="subtitle">{subtitle}</div>
        </div>
    </div>
}

PageHeader.propTypes = {
    className: PropTypes.string,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
}

