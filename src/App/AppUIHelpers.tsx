
import React from 'react';
import {Optional, Notification} from 'jshelpers';

export interface AppHelpers{
    screenDimmer: {
        setScreenDimmerVisibility(isVisible: boolean, animate: boolean): void;
        screenDimmerDidDismissNotification: Notification;
    }
}

export const AppHelpersContext = React.createContext<Optional<AppHelpers>>(null);

export function useAppHelpers(): AppHelpers{
    return React.useContext(AppHelpersContext)!;
}



