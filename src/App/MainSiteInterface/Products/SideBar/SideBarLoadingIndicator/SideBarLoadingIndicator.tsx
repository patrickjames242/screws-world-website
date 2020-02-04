import React from 'react';
import LoadingIndicator from 'random-components/LoadingIndicator/LoadingIndicator';


// the parent element of this component should have its position set to anything except static
export default function SideBarLoadingIndicator(){
    return <LoadingIndicator style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "4rem",
        height: "4rem",
    }}/>
}