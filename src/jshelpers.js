
import { useRef, useEffect } from 'react';
import {useHistory} from 'react-router-dom';

// The title will be set when the component mounts. if you pass null or undefined, the title will be set to simply "Screws World". If you pass anything else, the title will be "Screws World | <the string you passed>"
export function useSetTitleFunctionality(titleString) {
    titleString = titleString.trim()
    const screwsWorldText = "Screws World";

    useEffect(() => {    
        if (titleString == null || titleString === "") {
            document.title = screwsWorldText;
        } else {
            document.title = screwsWorldText + " | " + titleString;
        }
        // eslint-disable-next-line
    }, []);
}

export function useIsInitialRender(){
    const isInitialRenderRef = useRef(true);
    useEffect(() => {
        isInitialRenderRef.current = false;
    }, []);
    return isInitialRenderRef.current;
}


export const SCREWS_WORLD_EMAIL = "info@screwsworldbahamas.com";
export const SCREWS_WORLD_NUMBER = "(242) 326-1976";


// works just like useEffect, except that the effect is not called after the first render, as is the case with useEffect.
export function useUpdateEffect(effect, dependencies) {

    const flag = useRef(true);

    useEffect(() => {
        if (flag.current === true) {
            flag.current = false;
        } else {
            return effect();
        }
        // eslint-disable-next-line
    }, dependencies);
}

export function useBlockHistoryWhileMounted(message, shouldBlock = true) {

    const history = useHistory();

    useEffect(() => {
        if (shouldBlock === false){return;}
        const unblock = history.block(message);
        const unlistenToNotification = allHistoryBlocksShouldBeRemoved.addListener(() => {
            unblock();
        });
        const func = () => {
            callIfPossible(unlistenToNotification);
            unblock();
        }
        return func;
    }, [history, message, shouldBlock]);
}

export function getIntegerArray(upper, lower) {
    upper = Math.round(upper); lower = Math.round(lower);
    const numbers = [];
    for (let x = upper; x <= lower; x++) {
        numbers.push(x);
    }
    return numbers;
}


export class Notification{
    constructor(){
        let listeners = [];
        this.post = (info) => {
            listeners.forEach(l => l(info));
        }
        this.addListener = (listener) => {
            listeners.push(listener);
            return () => this.removeListener(listener);
        }
        this.removeListener = (listener) => {
            listeners = listeners.filter(x => x !== listener);
        }
    }
}

export const allHistoryBlocksShouldBeRemoved = new Notification();


export function callIfPossible(func, ...rest){
    if (func){
        return func(...rest);
    }
    return null;
}


// export function fixScrollingIssueBecauseOfTransitionAnimation() {

//     const scrollPositionKey = "scroll-position";
//     const cachedScrollPosition = Number(sessionStorage.getItem(scrollPositionKey)) || 0;
//     (function scrollPageToCachedScrollPosition() {
//         const timeout = 150;
//         let iterations = 0;
//         const interval = 5;

//         const intervalID = setInterval(() => {
//             iterations += 1;
//             const currentTime = iterations * interval;

//             if (document.documentElement.scrollTop !== cachedScrollPosition) {
//                 document.documentElement.scrollTop = cachedScrollPosition;
//             }

//             if (currentTime >= timeout) {
//                 clearInterval(intervalID);
//             }

//         }, interval);
//     })();

//     (function storeScrollPositionOnScroll() {
//         let timer;
//         window.addEventListener('scroll', () => {
//             timer && clearTimeout(timer);
//             timer = setTimeout(() => {
//                 const scrollPosition = document.documentElement.scrollTop;
//                 sessionStorage.setItem(scrollPositionKey, scrollPosition);
//             }, 100);
//         });
//     })();

// }


