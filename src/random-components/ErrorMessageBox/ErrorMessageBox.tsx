import './ErrorMessageBox.scss';
import React from 'react';
import errorIcon from 'assets/errorIcon';

export default function ErrorMessageBox(props: { errorMessage: string }) {
    return <div className="ErrorMessageBox">
        {errorIcon}
        <div className="text-box">{props.errorMessage}</div>
    </div>
}


